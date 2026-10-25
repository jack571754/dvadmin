cur_path=`pwd`
: "${MYSQL_ROOT_PASSWORD:?set MYSQL_ROOT_PASSWORD before running this script}"
docker rm mysql
# docker pull mysql:5.7
# docker pull mysql:5.5
docker run -p 3306:3306 --privileged=true --name mysql -v $cur_path/logs:/logs -v $cur_path/data:/var/lib/mysql -v $cur_path/conf.d/my.cnf:/etc/mysql/mysql.conf.d/mysqld.cnf -v $cur_path/run/:/var/run/mysql -e MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD" -d mysql:5.7
