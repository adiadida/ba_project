import Grid from "@mui/material/Grid";
import {SAWDataGrid} from "@/components/saw/SAWDataGrid";
import {GenericLikertCard} from "@/components/generics/GenericLikertCard";
import {Button} from "@mui/material";
import {useState} from "react";

export const SAWTables = ({numCols, numRows, numDM}: SWATablesProps) => {

    // central data collection for each decision maker
    const [decisionMakerData, setDecisionMakerData] = useState<{ [dmId: string]: any }>({});

    // Function to update data for a specific decision maker
    const handleDataChange = (dmId: string, data: any) => {
        setDecisionMakerData(prev => ({ ...prev, [dmId]: data }));
    };

    // Generate an array of React elements representing the tables
    const generateTables = () => {
        const tables = [];
        for (let i = 0; i < numDM; i++) {
            const dmId = `${i + 1}`;
            tables.push(
                <Grid key={i} size={{xs: 11, md: 5, lg: 3.8}}>
                    <SAWDataGrid id={dmId} numCols={numCols} numRows={numRows} onDataChange={(data) => handleDataChange(dmId, data)}/>
                </Grid>
            );
        }
        return tables;
    };

    return (
        <Grid container spacing={4} size={{xs: 12, md: 12, lg: 12}}
              sx={{
                  justifyContent: "center",
                  alignItems: "center",
              }}
        >
            <Grid container direction={'row'} spacing={2} alignItems={'center'} justifyContent={'center'}
                  size={12}>
                <Grid size={3}>
                    <GenericLikertCard title={'Priorisierung des Kriteriums'} one={'ganz und gar nicht wichtig'}
                                       two={'nicht wichtig'} three={'neutral'} four={'wichtig'}
                                       five={'voll und ganz wichtig'}/>
                </Grid>
                <Grid size={3}>
                    <GenericLikertCard title={'Erfüllung des Kriteriums'} one={'ganz und gar nicht erfüllt'}
                                       two={'nicht erfüllt'} three={'neutral'} four={'erfüllt'}
                                       five={'voll und ganz erfüllt'}/>
                </Grid>
            </Grid>

            {generateTables()}

            <Grid container direction={'row'} spacing={2} alignItems={'center'} justifyContent={'flex-end'}
                  size={12}>
                <Grid size={1}>
                   <Button variant={'contained'}>zu Schritt 2</Button>
                </Grid>
            </Grid>

        </Grid>
    )
}

export type SWATablesProps = {
    numCols: number,
    numRows: number,
    numDM: number,

}
