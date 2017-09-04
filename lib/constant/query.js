/**
 * Created by hmspl on 30/8/16.
 */
module.exports = {
    INSERTAUTH       : 'insert into $bucketName values ($key)',
    INSERTGPLUS      : 'insert into $bucketName values ($key)',
    INSERTFBDOC      : 'insert into $bucketName values ($key)',
    INSERTMOBILEDOC  : 'insert into $bucketName values ($key)',
    INSERTEMAILDOC   : 'insert into $bucketName values ($key)',
    INSERTSESSIONDOC : 'insert into $bucketName values ($key)',
    INSERTUSERDOC    : 'insert into $bucketName values ($key)',
    INSERTLINKEDINDOC: 'insert into $bucketName values ($key)',
    INSERTUSERDEVDOC : 'insert into $bucketName values ($key)',
    INSERTDEVICEDOC  : 'insert into $bucketName values ($key)',
    SELECTFBDOC      : 'select * from $bucketName use keys $key',
    SELECTAUTHDOC    : 'select * from $bucketName use keys $key',
    SELECTTWITTERDOC : 'select * from $bucketName use keys $key',
    SELECTEMAILDOC   : 'select * from $bucketName use keys $key',
    SELECTUSERDOC    : 'select * from $bucketName use keys $key',
    SELECTSESSIONDOC : 'select * from $bucketName use keys $key',
    SELECTUSERDEVDOC : 'select * from $bucketName use keys $key',
    SELECTGPLUSDOC   : 'select * from $bucketName use keys $key',
    SELECTDEVICEDOC  : 'select * from $bucketName use keys $key',
    SELECTLINKEDINDOC: 'select * from $bucketName use keys $key',
    SELECTMOBILEDOC  : 'select * from $bucketName use keys $key',
    UPDATEUSER       : 'update `$bucketName` use keys $key set $updateKey = $data ',
    UPDATEAUTH       : 'update $bucketName use keys $key set $updateKey = $data',
    UPDATEUSERDOC    : 'update $bucketName use keys $key unset $updateKey',
    UPDATEUSER2      : 'update $bucketName use keys $key set $updateKey = $data , $updateKey2 = $data2',
    SESSIONUSER2     : 'update $bucketName use keys $key set $updateKey = $data , $updateKey2 = $data2',
    UPDATEGPLUS      : 'update $bucketName use keys $key set $updateKey = $data',
    UPSERTUSERDOC    : 'upsert into $bucketName values($key) RETURNING *',
    UPSERTUSERDEVDOC : 'upsert into $bucketName values($key)',
    UPSERTDEVDOC     : 'upsert into $bucketName values($key)',
    DELETEAUTH       : 'delete from $bucketName use keys $key',
    DELETEGPLUS      : 'delete from $bucketName use keys $key',
    DELETEFB         : 'delete from $bucketName use keys $key'
}

/*

 var insertKey = '"' + dbKeys.AUTH + validData.id + '",' + JSON.stringify(validData);
 var reqObjParams = {
 bucketName: bucketName,
 key       : insertKey
 };
 commonService.queryBuilder(constantQuery.INSERTAUTH, reqObjParams, function (resData, resValue) {
 commonService.query(resData, resValue, function (err, result) {
 if(!err){
 return callback();
 }else{
 return callback(err)
 }
 });
 });

 */
