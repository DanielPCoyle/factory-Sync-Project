import { authenticateMiddleware } from "../middleware/routeMiddleware/authenticateMiddleware";
import { upload } from "../middleware/routeMiddleware/upload";
import { tryCatch } from "../services/api/tryCatch";

export const handleRoutes = ({routes,app}) => routes.map((route: any) => {
    const middleware: any = [];
    route.auth && middleware.push(authenticateMiddleware);
    route.upload && middleware.push(upload);
    app[route.method](route.route, middleware, async (req, res) => {
        return await tryCatch(() => 
            Boolean(route.socket) ? route.function(req, res, app) : route.function(req, res),
         res)
    });
});
