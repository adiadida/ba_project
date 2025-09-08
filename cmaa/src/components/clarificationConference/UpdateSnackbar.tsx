import {Snackbar} from "@mui/material";
import * as React from 'react';

export const UpdateSnackbar = ({open, onClose, resendCount}: UpdateSnackbarProps) => {

    const vertical = 'top';
    const horizontal = 'center';

    return (
        <Snackbar
            anchorOrigin={{vertical, horizontal}}
            open={open}
            onClose={onClose}
            message={`Vielen Dank für die Neu-Bewertung, auf die ihr euch geeinigt habt. Das ist eure ${resendCount}. Klärung!`}
            key={vertical + horizontal}
            autoHideDuration={10000}
        />
    )
}

export type UpdateSnackbarProps = {
    open: boolean;
    onClose: () => void;
    resendCount: number;
};