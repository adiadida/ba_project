'use client'
import {GenericHeader} from "@/components/generics/GenericHeader";
import Grid from "@mui/material/Grid";
// important with new update!
import {useSearchParams} from 'next/navigation';
import {SAWTables} from "@/components/saw/SAWTables";

export default function SWAPage() {
    //get params
    const searchParams = useSearchParams()
    const alternatives = searchParams.get("alternatives");
    const criteria = searchParams.get("criteria");
    const decisionMakers = searchParams.get("decisionMakers");

    // Convert from string to number
    const numA: number = alternatives ? parseInt(alternatives as string, 10) : 1;
    const numC: number = criteria ? parseInt(criteria as string, 10) : 1;
    const numDM: number = decisionMakers ? parseInt(decisionMakers as string, 10) : 1;

    /*function generateTables (numDM: number, numA: number, numC: number){
        Create tables array
        const newTables = [];
        for (let i = 0; i < numDM; i++) {
            newTables.push({
                rows: numC + 3, // row of header, criteria, weighted sum and rank
                columns: numA + 2, // cols of criteria, weights, alternatives
            });
        }
    }*/

    return (
        <Grid container spacing={2}>
            <GenericHeader title={'Nutzwertanalyse'}/>
            <SAWTables numCols={numA+2} numRows={numC+3} numDM={numDM}/>
        </Grid>
    )
}