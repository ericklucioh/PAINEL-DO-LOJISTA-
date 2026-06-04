type ApiError = {
    message?: string;
};

export function getApiErrorMessage(
    error: unknown,
    fallbackMessage: string,
): string {
    const possibleError = error as {
        response?: { data?: ApiError };
        message?: string;
    };

    const responseMessage = possibleError.response?.data?.message;
    if (
        typeof responseMessage === "string" &&
        responseMessage.trim().length > 0
    ) {
        return responseMessage;
    }

    if (
        typeof possibleError.message === "string" &&
        possibleError.message.trim().length > 0
    ) {
        return possibleError.message;
    }

    return fallbackMessage;
}
