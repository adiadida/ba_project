import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import {useRouter} from "next/navigation";
import {Button} from "@mui/material";

export const ExitModal = ({open, onClose, alternative, chance}: ExitModalProps) => {

    //const alternative = -1;
    //const chance = -1;
    const router = useRouter();

    const handleExitConfirm = () => {
      router.push(`/`);
    }

    return(
        <Dialog
        onClose={onClose}
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Die Entscheidung wurde getroffen
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Typography gutterBottom>
              {`Die Sieger-Empfehlung ist Alternative ${alternative} mit einer Gewinnerchance von ${chance} %`}
          </Typography>
          <Typography gutterBottom>
            Die Diskussion wird hiermit endgültig beendet. Mit dem Button kehrt ihr zur Startseite zurück.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleExitConfirm}>
            verstanden
          </Button>
        </DialogActions>
      </Dialog>
    )
}

export type ExitModalProps = {
  open: boolean;
  onClose: () => void;
  alternative: number;
  chance: number;
};