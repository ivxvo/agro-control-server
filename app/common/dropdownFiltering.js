const db = require("../models");
const Op = db.Sequelize.Op;

exports.validateFilter = (filter, approval) => {
    for(let field in filter) {
        if(!approval.includes(field)) {
            delete filter[field];
        }
    }
};

exports.getFilteredProperty = (params) => {
    const { model, include, limit, field, searchValue } = params;

    const condition = {};
    condition[field] = { [Op.iLike]: `${searchValue}%` };

    let result;
    if(include) {
        result = model.findAll({
            limit: limit,
            order: [[field, "ASC"]],
            where: condition,
            attributes: [["id", "value"], [field, "label"]],
            include: {
                model: include.model,
                required: true,
                attributes: []
            }
        });        
    } else {
        result = model.findAll({
            limit: limit,
            order: [[field, "ASC"]],
            where: condition,
            attributes: [["id", "value"], [field, "label"]]            
        });        
    }

    return result;
}