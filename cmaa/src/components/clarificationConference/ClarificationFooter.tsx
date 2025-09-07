import Grid from "@mui/material/Grid";
import {Button} from "@mui/material";
import {useState} from "react";
import {UpdateSnackbar} from "@/components/clarificationConference/UpdateSnackbar";
import {ExitModal} from "@/components/clarificationConference/ExitModal";
import {useRouter} from "next/navigation";
import {ClarificationInputsProps} from "@/components/clarificationConference/ClarificationInputs";


export const ClarificationFooter = ({conferenceCounter, setConferenceCounter, alternativeWinner, chanceWinner}: ClarificationInputsProps) => {

    const [isUpdateSnackbarOpen, setUpdateSnackbarOpen] = useState(false);
    const [isExitModalOpen, setExitModalOpen] = useState(false);

    const router = useRouter();

    //--- for Snackbar that indicates update
    const handleOpenUpdateSnackbar = () => {
        setUpdateSnackbarOpen(true);
    };

    const handleCloseUpdateSnackbar = () => {
        setUpdateSnackbarOpen(false);
    };

    const handleResend = () => {
        // todo pass new data to parent components: as router query or is there better way?
        if (setConferenceCounter) {
            setConferenceCounter(conferenceCounter + 1);
        }
        // resend data (from datagrid that needs to be implemented in ClarificationInputs)
        // Navigate to CMAAPage with data as query param
        // router.push(`/groupdecision/inputcaa?data=${dataString}`);
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
                onResend={handleResend}
                resendCount={conferenceCounter+1}
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

