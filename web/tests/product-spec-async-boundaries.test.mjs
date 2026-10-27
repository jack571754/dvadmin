import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const execute = (code, dependencies) => {
  const exports = {};
  const compiled = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  new Function(...Object.keys(dependencies), 'exports', compiled)(...Object.values(dependencies), exports);
  return exports;
};
const ref = value => ({ value });
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};

test('concurrent uploader batches keep one pending owner and respect the five-image cap', async () => {
  const text = source('../src/views/design_order/icon_library/components/IconImageUploader.vue');
  const code = text.slice(text.indexOf('async function handleFiles('), text.indexOf('\nonMounted(', text.indexOf('async function handleFiles(')));
  const props = { modelValue: [{}, {}, {}] }, uploading = ref(false), events = [], queue = [];
  const { handleFiles } = execute(`${code}\nexports.handleFiles = handleFiles;`, {
    props, uploading, MAX_ICON_IMAGES: 5,
    warningMessage() {}, errorMessage() {}, successMessage() {},
    emit: (event, value) => events.push([event, value]),
    update: value => { props.modelValue = value; },
    UploadImage: () => { const pending = deferred(); queue.push(pending); return pending.promise; },
  });
  const files = Array.from({ length: 4 }, () => ({ type: 'image/png' }));
  const first = handleFiles(files);
  await handleFiles(files); // Drop/paste while the initial upload is awaiting transport.
  assert.equal(queue.length, 1);
  assert.equal(uploading.value, true);
  queue[0].resolve({ data: { file_id: 4 } });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(queue.length, 2);
  assert.equal(uploading.value, true);
  queue[1].resolve({ data: { file_id: 5 } });
  await first;
  assert.equal(props.modelValue.length, 5);
  assert.equal(uploading.value, false);
  assert.deepEqual(events, [['uploading-change', true], ['uploading-change', false]]);
});

test('delayed editor save retains edits made after the saved revision and schedules autosave', async () => {
  const text = source('../src/views/design_order/product_spec/index.vue');
  const code = text.slice(text.indexOf('const saveWorkbookData = async'), text.indexOf('\nconst handleShareLink', text.indexOf('const saveWorkbookData = async')));
  for (const changedDuringRequest of [false, true]) {
    const pending = deferred(), isDirty = ref(true), isSaving = ref(false);
    let retries = 0, navigations = 0;
    const { save, edit } = execute(`${code}\nexports.save = saveWorkbookData; exports.edit = () => { editRevision++; isDirty.value = true; };`, {
      ensureEditableSubmission: () => true, isSaving, isDirty, editRevision: 1,
      workbook: { getActiveSheet: () => ({}), save: () => ({}) }, formCount: ref(0),
      iconDrawingRenderer: { clear() {} }, remapSnapshotProductColumns: snapshot => snapshot,
      rowsPerBlock: () => 14, colsPerBlock: () => 6, storageColumnsPerBlock: () => 6,
      PRODUCT_COLUMN_SNAPSHOT_WIDTH: 200, renderIconDrawings: async () => {},
      infoMessage() {}, successMessage() {}, errorMessage(error) { throw new Error(error); },
      request: () => pending.promise, submissionId: ref(1), submissionName: ref('name'), submissionShop: ref('shop'),
      submissionPlatform: ref('京东'), currentTemplateType: ref('main_image'), submissionStatus: ref('draft'),
      canEditSubmission: ref(true), canShareSubmission: ref(true), lastSavedAt: ref(null), route: { path: '/product_spec', query: {} }, router: { replace() { navigations++; } },
      resetAutoSaveTimer: () => { retries++; },
    });
    const saving = save('draft');
    assert.equal(isSaving.value, true);
    if (changedDuringRequest) edit();
    pending.resolve({ code: 2000, data: { id: 1, status: 'draft', canEdit: true, canShare: true } });
    await saving;
    assert.equal(isDirty.value, changedDuringRequest);
    assert.equal(retries, changedDuringRequest ? 1 : 0);
    assert.equal(navigations, changedDuringRequest ? 0 : 1);
    assert.equal(isSaving.value, false);
  }
});

test('share navigation away cancels delayed initialization before it touches a disposed Univer API', async () => {
  const text = source('../src/views/design_order/product_spec_share/index.vue');
  const render = text.slice(text.indexOf('const renderWorkbook = async'), text.indexOf('\nconst syncSnapshotStyles'));
  const dispose = text.slice(text.indexOf('const disposeUniver ='), text.indexOf('\nonMounted(', text.indexOf('const disposeUniver =')));
  const unmount = text.slice(text.indexOf('onBeforeUnmount(() =>'), text.indexOf('\n</script>', text.indexOf('onBeforeUnmount(() =>')));
  const timers = new Map(), queued = [], state = { disposed: false, events: 0, renders: 0 };
  let cleanup;
  const api = { createWorkbook: () => ({}), Event: { SheetSkeletonChanged: 'layout' }, setPermissionDialogVisible() {},
    addEvent() { assert.equal(state.disposed, false); state.events++; }, dispose() { state.disposed = true; } };
  const { renderWorkbook } = execute(`${render}\n${dispose}\n${unmount}\nexports.renderWorkbook = renderWorkbook;`, {
    disposed: false, renderRevision: 0, initializationTimers: new Set(), univerAPI: null, workbook: null,
    univerContainerRef: ref({}), createUniver: () => ({ univer: { registerPlugin() {} }, univerAPI: api }),
    LocaleType: { ZH_CN: 'zhCN' }, UniverPresetSheetsCoreZhCN: {},
    UniverSheetsCorePreset: () => ({}), UniverSheetsDrawingPreset: () => ({}), UniverVue3AdapterPlugin: {},
    window: { dispatchEvent() {} }, bindReadonlyGuard() {},
    iconDrawingRenderer: { dispose() {} }, renderIconDrawings: async () => { assert.equal(state.disposed, false); state.renders++; },
    setTimeout(callback) { const id = queued.length; queued.push(callback); timers.set(id, callback); return id; },
    clearTimeout: id => timers.delete(id), onBeforeUnmount: callback => { cleanup = callback; },
  });
  await renderWorkbook({ sheets: {} }, { fields: [] });
  assert.equal(timers.size, 2);
  cleanup(); // Simulates route unmount before the 300ms and 800ms callbacks.
  assert.equal(timers.size, 0);
  for (const callback of queued) callback(); // A callback already queued before cancellation is harmless too.
  assert.equal(state.events, 0);
  assert.equal(state.renders, 0);
});
