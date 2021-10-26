class _Response {
    constructor(status, data, message) {
        this.status = status
        this.data = data
        this.message = message
    }
}

class Controller {
    response(data={}, status=true, message='Success') {
        const response = new _Response(status, data, message)
        return response
    }
}

module.exports = Controller