import { deleteCall } from "../../services/api/delete";
import { parseURL } from "../../services/util";

export default async (req, res) => {
    try {
        const { model, id, subModels } = parseURL(req);
        req.params.model = model;
        req.params.id = id;
        req.params.subModels = subModels;
        const data = await deleteCall(req);
        res.json(data);
    } catch (e) {
        res.json(e);
    }
};
