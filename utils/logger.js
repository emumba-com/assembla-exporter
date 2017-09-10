import logUpdate from 'log-update'

class Line {
    constructor( str, callback ) {
        this.str = str
        this.callback = callback
    }
    update(str) {
        this.str = str
        this.callback(this)
    }
    toString() {
        return this.str
    }
}

class Logger {
    constructor() {
        this.lines = []
        this.handleUpdateLine = this.handleUpdateLine.bind(this)
    }
    handleUpdateLine(line) {
        this.render()
    }
    append(str) {
        const line = new Line( str, this.handleUpdateLine )

        this.lines.push( line )
        this.render()

        return line
    }
    render() {
        const str = this.lines
            .map(line => line.toString())
            .join('\n')

        logUpdate( str )
    }
}

export default new Logger()