import { getCall, getModels } from "../../services/api/get";
import { parseURL } from "../../services/util";

export default async (req, res) => {
    try {
        res.locals.good = "shit";
        const { model, id, subModels } = parseURL(req);
        if (model === "models") {
            const models = await getModels();
            res.json(models);
            return;
        }
        req.params.model = model;
        req.params.id = id;
        req.params.subModels = subModels;

        let data = await getCall(req);
        if (!Boolean(data)) {
            res.status(404).json({
                errors: [id ? model + " record #" + id + " not found" : "No records found"]
            });
            return;
        }
        // TODO: Move all this into getCall
        if (Object.keys(subModels).length) {
            Object.keys(subModels).forEach((key, i) => {
                if (Array.isArray(data)) {
                    if (subModels[key]) {
                        data = data.find(d => d.id === Number(subModels[key]));
                        data = data[key];
                    }
                } else {
                    data = data[key];
                    if (subModels[key]) {
                        data = data.find(d => d.id === Number(subModels[key]));
                    }
                }

            });
        }
        if (data.errors) {
            res.status(data.status).json(data);

        } else {
            res.json(data);
        }
    } catch (e) {
        console.log(e);
        res.status(404).json(e);
    }
};
