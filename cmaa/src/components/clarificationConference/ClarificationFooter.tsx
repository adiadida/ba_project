import Grid from "@mui/material/Grid";
import {Button} from "@mui/material";
import {useState} from "react";
import {UpdateSnackbar} from "@/components/clarificationConference/UpdateSnackbar";
import {ExitModal} from "@/components/clarificationConference/ExitModal";
//import {useRouter} from "next/navigation";
import {ClarificationInputsProps} from "@/components/clarificationConference/ClarificationInputs";


export const ClarificationFooter = ({
                                        conferenceCounter,
                                        alternativeWinner,
                                        chanceWinner,
                                        handleResend
                                    }: ClarificationInputsProps) => {

    const [isUpdateSnackbarOpen, setUpdateSnackbarOpen] = useState(false);
    const [isExitModalOpen, setExitModalOpen] = useState(false);

    //--- for Snackbar that indicates update
    const handleOpenUpdateSnackbar = () => {
        setUpdateSnackbarOpen(true);
        // resend happens automatically in DataGrids, but the handleResend triggers cmaa again
        handleResend();

        // Navigate to CMAAPage with data as query param or trough props?
        // const router = useRouter();
        // router.push(`/groupdecision/inputcaa?data=${dataString}`);
    };

    const handleCloseUpdateSnackbar = () => {
        setUpdateSnackbarOpen(false);
    };

    // for Dialog to return to start page
    const handleOpenExitModal = () => {
        setExitModalOpen(true);
    };

    const handleCloseExitModal = () => {
        setExitModalOpen(false);
    };

    return (
        <Grid container spacing={2} justifyContent={"flex-end"}>
            <Grid size={"auto"}>
                <Button variant={"contained"} onClick={handleOpenUpdateSnackbar}>Eingaben übernehmen</Button>
            </Grid>
            <Grid size={"auto"}>
                <Button onClick={handleOpenExitModal}>Diskussion beenden</Button>
            </Grid>

            {/* Feedback */}
            <UpdateSnackbar
                open={isUpdateSnackbarOpen}
                onClose={handleCloseUpdateSnackbar}
                resendCount={conferenceCounter}
            />

            <ExitModal
                open={isExitModalOpen}
                onClose={handleCloseExitModal}
                alternative={alternativeWinner}
                chance={chanceWinner}
            />

        </Grid>
    )
}

