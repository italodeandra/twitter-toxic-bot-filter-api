export function prepareLog(preparedData: any) {
    let data = { ...preparedData }
    data.type = data.type || 'info'

    const methods = {
        update(updatedData: any) {
            data = { ...preparedData, ...updatedData }
            return methods
        },
        set(setData: any) {
            data = { ...data, ...setData }
            return methods
        },
        save() {
            log(data.typ, data)
        }
    }

    return methods
}

export function logInfo(data: any): void {
    log('info', data)
}

export function logError(data: any) {
    log('error', data)
}

export function log(type: 'log' | 'info' | 'error', data: any): void {
    if (type === 'info') type = 'log'
    console[type](data)
}