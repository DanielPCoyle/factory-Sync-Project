import  apiDelete  from '../controller/api/apiDelete';
import  get  from '../controller/api/get';
import  post  from '../controller/api/post';
import  put  from '../controller/api/put';

export default [
    {
        method:"get",
        route:"/api*",
        function:get,
    },
    {
        method:"post",
        route:'/api*',
        function:post,
    },
    {
        method:"put",
        route:'/api*',
        function:put,
    },
    {
        method:"delete",
        route:'/api*',
        function:apiDelete,
    },
]
