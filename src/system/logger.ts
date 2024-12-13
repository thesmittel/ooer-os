
const levels : string[] = ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"]
export function log(level: number, module: string, func: string, message: string, printToConsole: boolean = false) {
    const datetime = new Date(Date.now())
    if (printToConsole) {
        console.log(
            `[${levels[level]}] (${datetime.toISOString()}): ${module}.${func} - "${message}"`
        )
    }
}