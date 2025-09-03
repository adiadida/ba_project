import {Accordion, AccordionDetails, AccordionSummary, Box, Typography} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const GenericAccordion = ({title, child}: GenericAccordionProps) => {
    return (


        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography>{title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box sx={{width: '95vw', margin: '0 auto'}}>
                    {child}
                </Box>
            </AccordionDetails>
        </Accordion>
    )
}

type GenericAccordionProps = {
    title: string;
    child: React.ReactNode;
}