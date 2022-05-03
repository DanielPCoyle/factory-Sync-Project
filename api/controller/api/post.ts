import { postCall } from "../../services/api/post";
import { parseURL } from "../../services/util";

export default async (req, res) => {
    try {
        const { model, id, subModels } = parseURL(req);
        req.params.model = model;
        req.params.id = id;
        req.params.subModels = subModels;
        const data = await postCall(req);
        res.json(data);
    } catch (e) {
        res.json(e);
    }
};
