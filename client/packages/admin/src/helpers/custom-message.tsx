import * as React from "react";
import {Notification, KIND} from "baseui/notification";

export const displaySuccessNotification = (message: string) => {
    return (
        <Notification
            kind={KIND.positive}
            closeable
            autoHideDuration={3000}
        >
            {() => message}
        </Notification>
    );
}

export const displayErrorMessage = (error: string) => {
    return (
        <Notification
            kind={KIND.negative}
            closeable
            autoHideDuration={3000}
        >
            {() => error}
        </Notification>
    );
}