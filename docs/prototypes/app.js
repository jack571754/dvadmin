const $ = id => document.getElementById(id);
const paths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',
  log: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>', more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>', moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>', panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
  folder: '<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>', download: '<path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5"/>',
  alert: '<path d="m12 3 10 18H2L12 3Z M12 9v4M12 17h0"/>', bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.grid}</svg>`;
const escapeText = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
function mountIcons() { document.querySelectorAll('[data-icon]').forEach(node => { node.innerHTML = icon(node.dataset.icon); }); }
const users = [
  { id: 1, name: '陈晨', account: 'chenchen', dept: '产品设计部', role: '超级管理员', state: 'active', login: '刚刚', color: 'violet' },
  { id: 2, name: '林远', account: 'linyuan', dept: '产品设计部', role: '运营管理员', state: 'active', login: '10 分钟前', color: 'blue' },
  { id: 3, name: '许知行', account: 'xuzhixing', dept: '研发中心', role: '普通成员', state: 'active', login: '25 分钟前', color: 'teal' },
  { id: 4, name: '苏念', account: 'sunian', dept: '市场运营部', role: '运营管理员', state: 'active', login: '1 小时前', color: 'rose' },
  { id: 5, name: '周宁', account: 'zhouning', dept: '研发中心', role: '普通成员', state: 'active', login: '2 小时前', color: 'amber' },
  { id: 6, name: '顾予安', account: 'guyuan', dept: '产品设计部', role: '普通成员', state: 'invited', login: '尚未登录', color: 'blue' },
  { id: 7, name: '叶青', account: 'yeqing', dept: '市场运营部', role: '普通成员', state: 'active', login: '昨天 18:30', color: 'teal' },
  { id: 8, name: '沈舟', account: 'shenzhou', dept: '研发中心', role: '普通成员', state: 'disabled', login: '10 月 20 日', color: 'neutral' },
];
const navigation = { home: ['工作台', 'grid'], users: ['用户管理', 'users'], roles: ['角色与权限', 'shield'], config: ['通用配置', 'settings'], logs: ['日志中心', 'log'], tasks: ['任务与审批', 'clock'] };
let view = 'all';
let selected = new Set();
let toastTimer;
const activities = [{ name: '林远', text: '更新了成员的组织信息', detail: '用户管理', time: '10 分钟前', color: 'blue' }, { name: '陈晨', text: '调整了运营管理员的访问权限', detail: '角色与权限', time: '35 分钟前', color: 'violet' }, { name: '苏念', text: '完成了新的成员账号配置', detail: '用户管理', time: '1 小时前', color: 'rose' }];
function toast(message) { clearTimeout(toastTimer); $('toast').textContent = message; $('toast').hidden = false; toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3000); }
function showPage(page) {
  const key = navigation[page] ? page : 'users';
  for (const name of ['users', 'home', 'roles', 'other']) $(name).hidden = name !== (['users', 'home', 'roles'].includes(key) ? key : 'other');
  $('breadcrumb').textContent = navigation[key][0];
  document.querySelectorAll('nav [data-page]').forEach(button => button.setAttribute('aria-current', button.dataset.page === key ? 'page' : 'false'));
  $('sidebar').classList.remove('mobile-open');
  if (key === 'home') renderHome();
  if (key === 'roles') renderRoles();
  if (['config', 'logs', 'tasks'].includes(key)) renderOther(key);
  history.replaceState(null, '', `#${key}`);
  mountIcons(); bindNavigation();
}
function bindNavigation() { document.querySelectorAll('[data-page]').forEach(button => { button.onclick = () => showPage(button.dataset.page); }); }
function filteredUsers() {
  const query = $('query').value.trim().toLowerCase();
  return users.filter(user => (view === 'all' || user.state === view) && (!$('deptFilter').value || user.dept === $('deptFilter').value)
    && (!$('roleFilter').value || user.role === $('roleFilter').value) && `${user.name} ${user.account} ${user.email || `${user.account}@example.com`}`.toLowerCase().includes(query));
}
function renderUsers() {
  const rows = filteredUsers();
  const scenario = $('listScenario').value;
  $('tableArea').hidden = scenario !== 'normal' || rows.length === 0;
  $('listEmpty').hidden = scenario === 'error' || (scenario === 'normal' && rows.length > 0);
  $('listError').hidden = scenario !== 'error';
  $('navCount').textContent = $('titleCount').textContent = $('allCount').textContent = users.length;
  $('invitedCount').textContent = users.filter(user => user.state === 'invited').length;
  $('disabledCount').textContent = users.filter(user => user.state === 'disabled').length;
  $('resultSummary').textContent = `共 ${scenario === 'normal' ? rows.length : 0} 位成员`;
  $('userRows').innerHTML = rows.map(user => `<tr><td class="check-cell"><input type="checkbox" aria-label="选择${escapeText(user.name)}" data-select="${user.id}" ${selected.has(user.id) ? 'checked' : ''} ${user.role === '超级管理员' ? 'disabled' : ''}></td><td><div class="identity-cell"><span class="avatar ${user.color}">${escapeText(user.name.slice(0, 1))}</span><span><b>${escapeText(user.name)}</b><small>${escapeText(user.email || `${user.account}@example.com`)}</small></span></div></td><td>${escapeText(user.dept)}</td><td><span class="role-tag ${user.role === '超级管理员' ? 'privileged' : ''}">${escapeText(user.role)}</span></td><td><span class="status-badge ${user.state}"><i></i>${({ active: '正常', invited: '待激活', disabled: '已停用' })[user.state]}</span></td><td class="muted">${escapeText(user.login)}</td><td><div class="row-actions"><button class="text-action" data-edit="${user.id}">编辑</button><button class="icon-button" data-more="${user.id}" aria-label="${escapeText(user.name)}的账号操作">${icon('more')}</button></div></td></tr>`).join('');
  document.querySelectorAll('[data-select]').forEach(box => { box.onchange = () => { box.checked ? selected.add(Number(box.dataset.select)) : selected.delete(Number(box.dataset.select)); updateSelection(); }; });
  document.querySelectorAll('[data-edit]').forEach(button => { button.onclick = () => openUser(users.find(user => user.id === Number(button.dataset.edit))); });
  document.querySelectorAll('[data-more]').forEach(button => { button.onclick = () => {
    const user = users.find(entry => entry.id === Number(button.dataset.more));
    if (user.role === '超级管理员') { toast('内置管理员账号受保护'); return; }
    confirmAction(`确认${user.state === 'disabled' ? '启用' : '停用'} ${user.name}？`, '变更只影响该成员的账号状态，成员信息将被保留。', '确认变更', () => { user.state = user.state === 'disabled' ? 'active' : 'disabled'; renderUsers(); toast('账号状态已更新'); });
  }; });
  const chips = [$('deptFilter').value, $('roleFilter').value].filter(Boolean);
  $('filterChips').hidden = !chips.length;
  $('filterChips').replaceChildren(...chips.map(text => { const button = document.createElement('button'); button.textContent = text + ' ×'; button.onclick = () => { if ($('deptFilter').value === text) $('deptFilter').value = ''; else $('roleFilter').value = ''; renderUsers(); }; return button; }));
  updateSelection();
}
function updateSelection() {
  $('bulkBar').hidden = !selected.size;
  $('selectedCount').textContent = `已选择 ${selected.size} 位成员`;
  const ids = filteredUsers().filter(user => user.role !== '超级管理员').map(user => user.id);
  $('selectAll').checked = !!ids.length && ids.every(id => selected.has(id));
  $('selectAll').indeterminate = ids.some(id => selected.has(id)) && !$('selectAll').checked;
}
function resetFilters() { $('query').value = ''; $('deptFilter').value = ''; $('roleFilter').value = ''; $('listScenario').value = 'normal'; view = 'all'; updateTabs(); renderUsers(); }
function updateTabs() { document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.view === view))); }
let queryTimer;
$('query').oninput = () => { clearTimeout(queryTimer); queryTimer = setTimeout(renderUsers, 150); };
for (const id of ['deptFilter', 'roleFilter', 'listScenario']) $(id).onchange = () => { selected.clear(); renderUsers(); };
document.querySelectorAll('[data-view]').forEach(button => { button.onclick = () => { view = button.dataset.view; selected.clear(); updateTabs(); renderUsers(); }; });
$('selectAll').onchange = () => { for (const user of filteredUsers().filter(entry => entry.role !== '超级管理员')) $('selectAll').checked ? selected.add(user.id) : selected.delete(user.id); renderUsers(); };
$('clearSelection').onclick = () => { selected.clear(); renderUsers(); };
$('disableSelected').onclick = () => confirmAction(`停用所选 ${selected.size} 个账号？`, '停用后，这些成员将无法登录。成员信息与历史记录会保留。', '停用账号', () => { users.filter(user => selected.has(user.id)).forEach(user => { user.state = 'disabled'; }); selected.clear(); renderUsers(); toast('所选账号已停用'); });
$('clearEmpty').onclick = resetFilters;
$('retryList').onclick = () => { $('listScenario').value = 'normal'; renderUsers(); };
$('exportButton').onclick = () => { const rows = filteredUsers(); const csv = [['姓名', '邮箱', '部门', '角色', '状态'], ...rows.map(user => [user.name, user.email || `${user.account}@example.com`, user.dept, user.role, user.state])].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' })); link.download = '成员列表-预览.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 500); toast('当前筛选的成员列表已导出'); };
$('themeToggle').onclick = () => { document.body.classList.toggle('dark'); $('themeToggle').setAttribute('aria-label', document.body.classList.contains('dark') ? '切换浅色模式' : '切换深色模式'); };
$('densityToggle').onclick = () => document.body.classList.toggle('compact');
$('menuToggle').onclick = () => window.innerWidth < 768 ? $('sidebar').classList.toggle('mobile-open') : document.body.classList.toggle('collapsed');
function renderHome() {
  const apps = ['users', 'roles', 'config', 'logs'];
  $('home').innerHTML = `<div class="page-heading"><div><div class="eyebrow">你的工作空间</div><h1>欢迎回来，陈晨</h1><p>从常用功能出发，让管理工作更有条理。</p></div><span class="date-label">2026 年 10 月 24 日 · 星期六</span></div><div class="overview-strip"><div><span>团队成员</span><strong>${users.length}<small>位</small></strong></div><div><span>访问角色</span><strong>3<small>个</small></strong></div><div><span>待激活账号</span><strong>${users.filter(user => user.state === 'invited').length}<small>位</small></strong></div></div><div class="home-layout"><div><section class="section-box"><div class="section-heading"><h2>常用功能</h2><small>你的管理入口</small></div><div class="app-grid">${apps.map((key, index) => `<button data-page="${key}"><span class="app-icon ${['violet', 'blue', 'amber', 'teal'][index]}">${icon(navigation[key][1])}</span><span><b>${navigation[key][0]}</b><small>${['组织成员与账号', '清晰的访问边界', '统一系统偏好', '追踪每一次操作'][index]}</small></span><span data-icon="arrow"></span></button>`).join('')}</div></section><section class="section-box activity-section"><div class="section-heading"><h2>最近动态</h2><button class="text-action" data-page="logs">查看全部 ${icon('arrow')}</button></div><div class="activity-list">${activities.map(item => `<div class="activity"><span class="avatar ${item.color}">${escapeText(item.name.slice(0, 1))}</span><div><p><b>${escapeText(item.name)}</b> ${escapeText(item.text)}</p><small>${item.detail}</small></div><time>${item.time}</time></div>`).join('')}</div></section></div><section class="section-box account-panel"><div class="section-heading"><h2>当前访问身份</h2>${icon('shield')}</div><div class="profile"><span class="avatar avatar-large violet">陈</span><strong>陈晨</strong><span>chenchen@example.com</span><span class="role-tag privileged">超级管理员</span></div><dl><dt>所属部门</dt><dd>产品设计部</dd><dt>账号状态</dt><dd>正常</dd></dl><button class="full-width" id="profileOpen">管理个人资料 ${icon('arrow')}</button></section></div>`;
  $('profileOpen').onclick = () => openUser(users[0]);
}
function renderRoles() {
  const roles = ['超级管理员', '运营管理员', '普通成员'];
  $('roles').innerHTML = `<div class="page-heading"><div><div class="title-line"><h1>角色与权限</h1><span class="count-badge">3</span></div><p>以角色组织权限，让团队成员各司其职。</p></div><button class="primary" id="openRole">${icon('shield')} 配置角色权限</button></div><div class="role-overview"><span class="app-icon violet">${icon('shield')}</span><div><b>清晰的权限边界</b><p>菜单、操作与字段权限分别配置，数据范围按需授权。</p></div></div><div class="data-surface table-scroll"><table class="roles-table"><thead><tr><th>角色</th><th>权限说明</th><th>关联成员</th><th>状态</th><th>操作</th></tr></thead><tbody>${roles.map((name, index) => `<tr><td><div class="identity-cell"><span class="app-icon ${['violet', 'blue', 'neutral'][index]}">${icon(index ? 'users' : 'shield')}</span><span><b>${name}</b><small>${['Super administrator', 'Operations manager', 'Member'][index]}</small></span></div></td><td>${['管理全部系统功能与访问权限', '管理组织成员和运营数据', '查询本人被授权的数据'][index]}</td><td>${users.filter(user => user.role === name).length} 位成员</td><td><span class="status-badge"><i></i>启用</span></td><td>${index === 0 ? '<span class="muted">系统内置</span>' : `<button class="text-action" data-open-role="${name}">配置权限 ${icon('arrow')}</button>`}</td></tr>`).join('')}</tbody></table></div>`;
  $('openRole').onclick = () => openPermissions('运营管理员');
  document.querySelectorAll('[data-open-role]').forEach(button => { button.onclick = () => openPermissions(button.dataset.openRole); });
}
function renderOther(page) {
  $('other').innerHTML = `<div class="page-heading"><div><h1>${navigation[page][0]}</h1><p>沿用统一的信息层级、反馈与访问规则。</p></div></div><div class="section-box">${page === 'logs' ? activities.map(item => `<div class="activity"><span class="avatar ${item.color}">${escapeText(item.name[0])}</span><div><p><b>${escapeText(item.name)}</b> ${escapeText(item.text)}</p><small>${item.detail}</small></div><time>${item.time}</time></div>`).join('') : `<div class="state-view"><span class="state-icon">${icon(navigation[page][1])}</span><h2>${page === 'config' ? '系统配置入口' : '任务与审批入口'}</h2><p>此预览聚焦成员管理与授权交互，完整功能请前往实际管理后台。</p><button data-page="users">返回成员管理</button></div>`}</div>`;
}
let editedUser = null;
let initialForm = '';
const formValue = () => JSON.stringify(['userName', 'userEmail', 'userDept', 'userRole'].map(id => $(id).value));
function openUser(user) { editedUser = user || null; $('userTitle').textContent = user ? '编辑用户' : '新建用户'; $('userName').value = user?.name || ''; $('userEmail').value = user?.email || (user ? `${user.account}@example.com` : ''); $('userDept').value = user?.dept || '产品设计部'; $('userRole').value = user?.role === '超级管理员' ? '运营管理员' : user?.role || '普通成员'; $('userRole').disabled = user?.role === '超级管理员'; initialForm = formValue(); $('userDialog').showModal(); }
function closeUser() { if (formValue() !== initialForm) confirmAction('有未保存的更改', '成员信息尚未保存。现在离开将放弃这些修改。', '放弃更改', () => $('userDialog').close()); else $('userDialog').close(); }
$('createUser').onclick = () => openUser();
$('cancelUser').onclick = $('discardUser').onclick = closeUser;
$('userDialog').addEventListener('cancel', event => { event.preventDefault(); closeUser(); });
$('userForm').onsubmit = event => { event.preventDefault(); const values = { name: $('userName').value.trim(), email: $('userEmail').value.trim(), dept: $('userDept').value }; if (!values.name) { $('userName').setCustomValidity('姓名不能为空'); $('userName').reportValidity(); return; } if (editedUser) Object.assign(editedUser, values, editedUser.role === '超级管理员' ? {} : { role: $('userRole').value }); else users.push({ id: Date.now(), ...values, account: 'new-member', role: $('userRole').value, state: 'invited', login: '尚未登录', color: 'blue' }); activities.unshift({ name: '陈晨', text: editedUser ? '更新了成员信息' : '创建了一个新成员账号', detail: '用户管理', time: '刚刚', color: 'violet' }); $('userDialog').close(); renderUsers(); toast('用户信息已保存'); };
$('userName').oninput = () => $('userName').setCustomValidity('');
$('accountButton').onclick = () => openUser(users[0]);
$('notificationsOpen').onclick = () => toast('暂时没有需要处理的新消息');
let confirmCallback;
function confirmAction(title, copy, accept, callback) { $('unsavedTitle').textContent = title; $('unsavedDialog').querySelector('p').textContent = copy; $('discardFields').textContent = accept; $('continueEditing').textContent = title === '有未保存的更改' ? '继续编辑' : '取消'; confirmCallback = callback; $('unsavedDialog').showModal(); }
$('continueEditing').onclick = () => $('unsavedDialog').close();
$('discardFields').onclick = () => { $('unsavedDialog').close(); confirmCallback?.(); };
const fieldNames = [['姓名', 'name'], ['手机号', 'mobile'], ['邮箱', 'email']];
const roleFields = { '运营管理员': Array(9).fill(true), '普通成员': [true, false, false, false, false, false, true, false, false] };
let currentRole = '运营管理员';
let savedFields = [];
const fieldsValue = () => Array.from($('fieldRows').querySelectorAll('input'), input => input.checked);
const fieldsDirty = () => JSON.stringify(fieldsValue()) !== JSON.stringify(savedFields);
function fieldState() { $('fieldState').textContent = fieldsDirty() ? '有未保存的更改' : '所有更改已保存'; $('fieldState').classList.toggle('pending', fieldsDirty()); }
function openPermissions(name) { currentRole = name; savedFields = [...roleFields[name]]; $('permissionTitle').textContent = name; $('fieldRows').innerHTML = fieldNames.map(([label, field], index) => `<tr><td>${label}<small>${field}</small></td>${['查询', '新增', '编辑'].map((action, column) => `<td><input type="checkbox" aria-label="${label}${action}权限" ${savedFields[index * 3 + column] ? 'checked' : ''}></td>`).join('')}</tr>`).join(''); $('fieldRows').querySelectorAll('input').forEach(box => { box.onchange = fieldState; }); $('saveError').hidden = true; fieldState(); $('permissionDrawer').showModal(); }
function closePermissions() { if (fieldsDirty()) confirmAction('有未保存的更改', '当前菜单的字段权限尚未保存。离开后，这些更改将被放弃。', '放弃更改', () => { $('permissionDrawer').close(); }); else $('permissionDrawer').close(); }
$('closePermissions').onclick = closePermissions;
$('permissionDrawer').addEventListener('cancel', event => { event.preventDefault(); closePermissions(); });
document.querySelectorAll('[data-section]').forEach(button => { button.onclick = () => { for (const id of ['operations', 'fields']) $(id).hidden = id !== button.dataset.section; document.querySelectorAll('[data-section]').forEach(tab => tab.setAttribute('aria-selected', String(tab === button))); }; });
$('operationRows').innerHTML = [['查询用户', '查看用户列表与详情'], ['新增用户', '创建新的成员账号'], ['编辑用户', '修改成员信息与账号状态'], ['删除用户', '移除成员账号']].map(([name, hint], index) => `<div class="operation-row"><label><input type="checkbox" ${index < 2 ? 'checked' : ''}>${name}</label><small>${hint}</small></div>`).join('');
async function saveButton(button, task) { button.disabled = true; const label = button.textContent; button.textContent = '保存中…'; try { await new Promise(resolve => setTimeout(resolve, 500)); await task(); } finally { button.disabled = false; button.textContent = label; } }
$('saveFields').onclick = () => { const snapshot = fieldsValue(); saveButton($('saveFields'), () => { if ($('saveScenario').value === 'error') { $('saveError').hidden = false; $('fieldState').textContent = '尚未保存'; return; } savedFields = snapshot; roleFields[currentRole] = [...snapshot]; $('saveError').hidden = true; fieldState(); toast('当前菜单的字段权限已保存'); }); };
$('menuPermission').onchange = () => { const before = !$('menuPermission').checked; $('menuPermission').disabled = true; $('menuState').textContent = '正在保存…'; setTimeout(() => { if ($('saveScenario').value === 'error') { $('menuPermission').checked = before; $('menuState').textContent = '保存失败，已恢复原状态'; } else $('menuState').textContent = '已即时生效'; $('menuPermission').disabled = false; }, 450); };
$('saveOperations').onclick = () => saveButton($('saveOperations'), () => { $('operationState').textContent = $('saveScenario').value === 'error' ? '保存失败，配置仍保留' : '当前菜单的操作配置已保存'; });
function renderCommand() { const query = $('commandQuery').value.trim(); $('commandResults').innerHTML = Object.entries(navigation).filter(([, value]) => value[0].includes(query)).map(([key, [title, name]]) => `<button data-command="${key}">${icon(name)}${title}<span data-icon="arrow"></span></button>`).join('') || '<p class="description" style="padding:15px">没有匹配的功能，试试其他关键词。</p>'; mountIcons(); $('commandResults').querySelectorAll('button').forEach(button => { button.onclick = () => { $('commandDialog').close(); showPage(button.dataset.command); }; }); }
$('commandOpen').onclick = () => { $('commandQuery').value = ''; renderCommand(); $('commandDialog').showModal(); $('commandQuery').focus(); };
$('commandQuery').oninput = renderCommand;
$('commandQuery').onkeydown = event => { if (event.key === 'ArrowDown') { event.preventDefault(); $('commandResults').querySelector('button')?.focus(); } if (event.key === 'Enter') $('commandResults').querySelector('button')?.click(); };
document.addEventListener('keydown', event => { const editing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName); if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (!$('commandDialog').open) $('commandOpen').click(); } else if (event.key === '/' && !editing && !document.querySelector('dialog[open]')) { event.preventDefault(); showPage('users'); $('query').focus(); } });
renderUsers(); showPage(location.hash.slice(1) || 'users'); mountIcons();
