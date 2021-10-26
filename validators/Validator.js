const validation = require('validation')
const validator = require('validator')
const Helper = require('../libs/helper')

class Validator {
    async validate(payload, required = [], optional = []) {
        const rules = []
        for(let key in this) {
            var _rules = []
            if (required.includes(key)) {
                _rules.push('required')
            }
            rules.push({
                key,
                value: payload[key],
                rules: _rules.concat(this[key])
            })
        }

        for (let optionalIndex in optional) {
            let optionalRule = optional[optionalIndex]
            for (let optinalRuleIndex in optionalRule) {
                let optionalField = optionalRule[optinalRuleIndex]
                optionalField.value = payload[optionalField.key]
                rules.push(optionalField)
            }
        }
        return await this.#check(rules)
    }
    getSpecificRule(keys, required = []) {
        const origin_keys = Object.keys(this)
        const rules = []

        for (let i in keys) {
            if (!origin_keys.includes(keys[i])) {
                continue
            }
            var _rules = []
            if (required.includes(keys[i])) {
                _rules.push('required')
            }
            rules.push({
                key: keys[i],
                rules: _rules.concat(this[keys[i]])
            })
        }
        return rules
    }
    async #check (fields) {
        let result = {}
        let error = false
        let content = {}
        for (let i = 0; i < fields.length; i++) {
            var messages = []
            for (let j = 0; j < fields[i].rules.length; j++) {
                if (fields[i].value !== undefined) {
                    fields[i].value = String(fields[i].value).trim()
                    if (fields[i].value == '') {
                        fields[i].value = undefined
                    }
                }
                if (fields[i].rules[j].includes('string')) {
                    if (fields[i].value == undefined) {
                        continue
                    }
                    var stringOption = fields[i].rules[j].split(':')
                    if (stringOption.length > 2) {
                        for (let so = 2 ; so < stringOption.length; so++) {
                            stringOption[1] += `:${stringOption[so]}`
                        }
                    }
                    var stringOptionRule = stringOption[1].split('=')
                    if (stringOptionRule.length !== 2) {
                        continue
                    }
                    var stringOptionRuleType = stringOptionRule[0]
                    var stringOptionRuleValue = stringOptionRule[1]

                    if (stringOptionRuleType == 'max') {
                        if (fields[i].value == undefined) {
                            continue
                        }

                        if (fields[i].value.length > Number(stringOptionRuleValue)) {
                            messages.push(`${fields[i].key} cannot longer than ${stringOptionRuleValue} characters`)
                        }
                    }

                    if (stringOptionRuleType == 'must_in') {
                        stringOptionRuleValue = stringOptionRuleValue.split('')
                        var characters = fields[i].value.split('')
                        for (let c in characters) {
                            if (!stringOptionRuleValue.includes(characters[c])) {
                                messages.push(`${fields[i].key} content must in [${stringOptionRuleValue}] characters`)
                                break
                            }
                        }
                    }
                }
                if (fields[i].rules[j].includes('enum')) {
                    if (fields[i].value == undefined) {
                        continue
                    }
                    var enumOption = fields[i].rules[j].split(':')
                    if (enumOption.length !== 2) {
                        continue
                    }
                    var enumOptionRule = enumOption[1].split(',')
                    if (enumOptionRule.length == 0) {
                        continue
                    }
                    if (!enumOptionRule.includes(String(fields[i].value))) {
                        messages.push(`${fields[i].key} must have value one of [${enumOptionRule.toString()}]`)
                    }
                }
                if (fields[i].rules[j] == 'lowercase') {
                    if (validation.exists(fields[i].value)) {
                        fields[i].value = fields[i].value.toLowerCase()
                    }
                }
                if (fields[i].rules[j] == 'uppercase') {
                    if (validation.exists(fields[i].value)) {
                        fields[i].value = fields[i].value.toUpperCase()
                    }
                }

                if (fields[i].rules[j] == 'trim') {
                    if (validation.exists(fields[i].value)) {
                        fields[i].value = fields[i].value.trim()
                    }
                }

                if (fields[i].rules[j] == 'required') {
                    if (!validation.exists(fields[i].value)) {
                        messages.push(fields[i].key + ' is required')
                    }
                }

                if (fields[i].rules[j] == 'required_on') {
                    if (validation.exists(fields[i].required_on)) {
                        if (fields[i].required_on_value.includes(fields[i].required_on)) {
                            if (!validation.exists(fields[i].value)) {
                                messages.push(`${fields[i].key} is required when ${fields[i].required_on_key} is ${fields[i].required_on_value.toString()}`)
                            }
                        } else {
                            fields[i].rules = []
                        }
                    }
                }

                if (fields[i].rules[j] == 'enum') {
                    if (messages.length == 0) {
                        if (validation.exists(fields[i].value) && fields[i].enum.indexOf(fields[i].value) == -1) {
                            messages.push(`${fields[i].key} must have value one of [${fields[i].enum.toString()}]`)
                        }
                    }
                }

                if (validation.exists(fields[i].value) && fields[i].rules[j] == 'email') {
                    if (!this.isEmail(fields[i].value)) {
                        messages.push('Invalid email address')
                    }
                }

                if (fields[i].rules[j] == 'equal_with') {
                    if (fields[i].value != fields[i].value2) {
                        messages.push(fields[i].key + ' and ' + fields[i].key2 + ' is not match')
                    }
                }

                if (validation.exists(fields[i].value) && fields[i].rules[j] == 'unique') {
                    let findData = await fields[i].model.database.connection.query(`SELECT id FROM ${fields[i].model.table} WHERE ${fields[i].key} = $1`, [fields[i].value])
                    if (findData.rowCount > 0) {
                        messages.push(fields[i].value + ' was already exist')
                    }
                }

                if (validation.exists(fields[i].value) && fields[i].rules[j] == 'unique_except') {
                    let findData = await fields[i].model.database.connection.query(
                        `SELECT id FROM ${fields[i].model.table} WHERE ${fields[i].key} = $1`
                        , [fields[i].value]
                    )
                    if (findData.rowCount > 0) {
                        if (findData.rows[0].id != fields[i].unique_except)
                            messages.push(fields[i].value + ' was already exist')
                    }
                }

                if (validation.exists(fields[i].value) && fields[i].rules[j] == 'date') {
                    if (!validator.isISO8601(fields[i].value, {strict: true, strictSeparator: true})) {
                        messages.push('Invalid Date, Not YYYY-MM-DDThh:mm:ss format')
                    }
                }

                if (validation.exists(fields[i].value) && fields[i].rules[j] == 'number') {
                    if (!validator.isNumeric(String(fields[i].value))) {
                        messages.push(`Invalid ${fields[i].key}, Not numeric format`)
                    }
                    fields[i].value = Number(fields[i].value)
                }
                if (validation.exists(fields[i].value) && fields[i].rules[j] == 'boolean') {
                    if (!validator.isBoolean(String(fields[i].value))) {
                        messages.push(`Invalid ${fields[i].key}, Not boolean format`)
                    }
                    fields[i].value = Boolean(fields[i].value)
                }

                if (validation.exists(fields[i].value) && fields[i].rules[j] == 'escape') {
                    fields[i].value = validator.escape(fields[i].value)
                }

                if (validation.exists(fields[i].value) && fields[i].rules[j] == 'regex') {
                    let pattern = new RegExp(fields[i].regex)
                    if (!pattern.test(fields[i].value)) {
                        messages.push(fields[i].regex_message)
                    }
                }

                if (validation.exists(fields[i].value) && messages.length == 0 && fields[i].rules[j] == 'ownership') {
                    let findData = await fields[i].model.database.connection.query(`
                        SELECT id 
                        FROM ${fields[i].model.table} 
                        WHERE ${fields[i].key} = $1 AND ${fields[i].ownership_key} = $2`, [fields[i].value, fields[i].ownership_value])
                    if (findData.rowCount == 0) {
                        messages.push(`Sorry, ${fields[i].key} = ${fields[i].value} is not your property`)
                    }
                }

                if (messages.length == 0 &&  fields[i].rules[j] == 'page') {
                    if (fields[i].value < 1) {
                        messages.push(`Field ${fields[i].key}, can't lower than 1`)
                    }
                }
                if (fields[i].rules[j] == 'local_datetime') {
                    if (fields[i].value == undefined) {
                        continue
                    }
                    if (Helper.stringLocalTimeToDate(fields[i].value) == null) {
                        messages.push(`Field ${fields[i].key} must have format -> DD/MM/YYYY HH:mm:ss`)
                    }
                }
            }

            content[fields[i].key] = fields[i].value

            if (messages.length > 0) {
                error = true
                result[fields[i].key] = messages
            }
        }
        if (error) {
            throw result
        } else {
            return content
        }
    }
    static isEmail (mail) {
        let re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm
        return re.test(mail) ? true : false
    }
    
    static isDate (date) {
        return validation.isType(date, 'date')
    }
}

module.exports = Validator