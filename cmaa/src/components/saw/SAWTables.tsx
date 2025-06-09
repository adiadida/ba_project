import Grid from "@mui/material/Grid";
import {SAWDataGrid} from "@/components/saw/SAWDataGrid";
import {GenericLikertCard} from "@/components/generics/GenericLikertCard";

export const SAWTables = ({numCols, numRows, numDM}: SWATablesProps) => {

    // Generate an array of React elements representing the tables
    const generateTables = () => {
        const tables = [];
        for (let i = 0; i < numDM; i++) {
            tables.push(
                <Grid key={i} size={{xs: 11, md: 5, lg: 3.8}}>
                    <SAWDataGrid id={`${i + 1}`} numCols={numCols} numRows={numRows}/>
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

        </Grid>
    )
}

export type SWATablesProps = {
    numCols: number,
    numRows: number,
    numDM: number,

}
