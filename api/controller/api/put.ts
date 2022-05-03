import { putCall } from "../../../services/api/put";
import { parseURL } from "../../../services/util";

export default async (req, res) => {
    try {
        const { model, id, subModels } = parseURL(req);
        req.params.model = model;
        req.params.id = id;
        req.params.subModels = subModels;
        const data = await putCall(req);
        res.send(data);
    } catch (e) {
        res.send(e);
    }
};
