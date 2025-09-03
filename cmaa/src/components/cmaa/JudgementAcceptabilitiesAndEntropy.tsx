import {Grid} from "@mui/material";
import {useEffect, useState} from "react";
import {JudgementAcceptabilityDataGrid} from "@/components/cmaa/JudgementAcceptabilityDataGrid";
import {PotentialJudgementEntropyDataGrid} from "@/components/cmaa/PotentialJudgementEntropyDataGrid";


export const JudgementAcceptabilitiesAndEntropy = ({
                                                       kMonteCarlo,
                                                       judgCircumstanceCounter,
                                                       judgMultiInputs
                                                   }: JudgementProps) => {
    // state management
    const [currentJudgAcceptability, setCurrentJudgAcceptability] = useState<number[][][][]>([]);
    const [potentialJudgAcceptability, setPotentialJudgAcceptability] = useState<number[][][][]>([]);
    const [potentialJudgementEntropy, setPotentialJudgementEntropy] = useState<number[][][]>([]);

    const initializeJudgmentAcceptability = () => {

        let judgAcceptability: number[][][][] = [];

        // console.log('judg circ c:', judgCircumstanceCounter);
        // console.log('num AltWinner', judgCircumstanceCounter.length);
        // console.log('num criteria', judgCircumstanceCounter[0].length);
        // console.log('num alt', judgCircumstanceCounter[0][0].length);
        // console.log('judg idx', judgCircumstanceCounter[0][0][0].length)

        for (let altWinner = 0; altWinner < judgCircumstanceCounter.length; altWinner++) {
            judgAcceptability[altWinner] = [];

            for (let crit = 0; crit < judgCircumstanceCounter[altWinner].length; crit++) {
                judgAcceptability[altWinner][crit] = [];

                for (let alt = 0; alt < judgCircumstanceCounter[altWinner][crit].length; alt++) {
                    judgAcceptability[altWinner][crit][alt] = [];

                    for (let judgIdx = 0; judgIdx < judgCircumstanceCounter[altWinner][crit][alt].length; judgIdx++) {
                        judgAcceptability[altWinner][crit][alt][judgIdx] = 0;
                    }
                }
            }
        }

        return judgAcceptability;
    }

    // calculates current acceptability by normalizing counts over kMonteCarlo
    // -> becomes probability/distribution
    function computeCurrentJudgAcceptability() {

        let currentJudgAcceptability = initializeJudgmentAcceptability();

        for (let altWinner = 0; altWinner < judgCircumstanceCounter.length; altWinner++) {
            currentJudgAcceptability[altWinner] = [];

            for (let crit = 0; crit < judgCircumstanceCounter[altWinner].length; crit++) {
                currentJudgAcceptability[altWinner][crit] = [];

                for (let alt = 0; alt < judgCircumstanceCounter[altWinner][crit].length; alt++) {
                    currentJudgAcceptability[altWinner][crit][alt] = [];

                    for (let judgIdx = 0; judgIdx < judgCircumstanceCounter[altWinner][crit][alt].length; judgIdx++) {
                        currentJudgAcceptability[altWinner][crit][alt][judgIdx] = judgCircumstanceCounter[altWinner][crit][alt][judgIdx] / kMonteCarlo;

                    }
                }

            }
        }

        return currentJudgAcceptability;
    }

    // normalizes current acceptability across alternatives for each preference
    // -> normalized probability/distribution
    function computePotentialJudgAcceptability(currJudgAcceptability: number[][][][]) {

        const currJudgAcc = currJudgAcceptability;
        let potentialJudgAcceptability = initializeJudgmentAcceptability();


        // error handling
        if (isNaN(currJudgAcc[0][0][0][0]) || !isFinite(currJudgAcc[0][0][0][0])) {
            console.log('potential preference acceptability is NaN or infinity');
            return potentialJudgAcceptability;
        }

        for (let altWinner = 0; altWinner < judgCircumstanceCounter.length; altWinner++) {

            for (let crit = 0; crit < judgCircumstanceCounter[altWinner].length; crit++) {

                for (let alt = 0; alt < judgCircumstanceCounter[altWinner][crit].length; alt++) {

                    for (let judgIdx = 0; judgIdx < judgCircumstanceCounter[altWinner][crit][alt].length; judgIdx++) {

                        // sum for normalization
                        let sum = 0;
                        for (let aWinner = 0; aWinner < judgCircumstanceCounter.length; aWinner++) {
                            sum += currJudgAcc[aWinner][crit][alt][judgIdx];
                        }

                        potentialJudgAcceptability[altWinner][crit][alt][judgIdx] = currJudgAcc[altWinner][crit][alt][judgIdx] / sum;

                    }
                }
            }
        }

        return potentialJudgAcceptability;
    }

    const initializeJudgementEntropy = () => {
        let judgEntropy: number[][][] = [];

        for (let crit = 0; crit < judgMultiInputs.length; crit++) {
            judgEntropy[crit] = [];
            for (let alt = 0; alt < judgMultiInputs[crit].length; alt++) {
                judgEntropy[crit][alt] = [];
                for (let judgIdx = 0; judgIdx < judgMultiInputs[crit][alt].length; judgIdx++) {
                    judgEntropy[crit][alt][judgIdx] = 0;
                }
            }

        }

        return judgEntropy;
    }

    // loop over potential pref acceptability and compute judgement entropy
    // calculates Shannon entropy for the potential judgement acceptability distributions
    function computeJudgementEntropy(potJudgAcceptability: number[][][][]) {
        const potJudgAcc = potJudgAcceptability;
        let judgementEntropy: number[][][] = initializeJudgementEntropy();


        for (let crit = 0; crit < judgMultiInputs.length; crit++) {

            for (let alt = 0; alt < judgMultiInputs[crit].length; alt++) {

                for (let judgIdx = 0; judgIdx < judgMultiInputs[crit][alt].length; judgIdx++) {


                    let sumPotJudg = 0;
                    for (let altWinner = 0; altWinner < judgCircumstanceCounter.length; altWinner++) {
                        sumPotJudg += potJudgAcc[altWinner][crit][alt][judgIdx];
                    }

                    // Compute entropy for this criterion and preference index
                    let entropy = 0;
                    if (sumPotJudg > 0) {
                        for (let altWinner = 0; altWinner < judgCircumstanceCounter.length; altWinner++) {
                            const p = potJudgAcc[altWinner][crit][alt][judgIdx] / sumPotJudg;
                            if (p > 0) {
                                entropy -= p * Math.log2(p);
                            }
                        }
                    }
                    judgementEntropy[crit][alt][judgIdx] = entropy;
                }
            }

        }
        return judgementEntropy;
    }


    useEffect(() => {

        if (judgCircumstanceCounter[0][0][0][0] !== undefined && !isNaN(judgCircumstanceCounter[0][0][0][0]) && judgMultiInputs[0][0][0] !== undefined) { // error handling

            const currJudgAcc: number[][][][] = computeCurrentJudgAcceptability();
            //console.log('current ', currJudgAcc);

            if (!isNaN(currJudgAcc[0][0][0][0]) && isFinite(currJudgAcc[0][0][0][0])) { // error handling
                setCurrentJudgAcceptability(currJudgAcc);
                const potJudgAcc = computePotentialJudgAcceptability(currJudgAcc);
                //console.log('potential', potJudgAcc)
                setPotentialJudgAcceptability(potJudgAcc);
                const judgEntropy = computeJudgementEntropy(potJudgAcc);
                setPotentialJudgementEntropy(judgEntropy);
                console.log('pot judg entr: ', judgEntropy);
            }
        }

    }, [kMonteCarlo, judgCircumstanceCounter, judgMultiInputs]);

    // Generate an array of React elements representing the acceptabilities
    const generateAcceptabilites = () => {
        const acceptabilities = [];
        for (let winner = 0; winner < judgCircumstanceCounter.length; winner++) {
            const altWinner = winner + 1;
            acceptabilities.push(
                <Grid key={`currAltWinner${winner}`} size={12}>
                    <JudgementAcceptabilityDataGrid isCurrent={true} altWinner={altWinner}
                                                     judgementAcceptability={currentJudgAcceptability[winner]}
                                                     judgementMultiInputs={judgMultiInputs}/>
                </Grid>
            );
            //console.log('current JA for altWinner ', altWinner,currentJudgAcceptability[winner])
            acceptabilities.push(
                <Grid key={`potAltWinner${winner}`} size={12}>
                    <JudgementAcceptabilityDataGrid isCurrent={false} altWinner={altWinner}
                                                     judgementAcceptability={potentialJudgAcceptability[winner]}
                                                     judgementMultiInputs={judgMultiInputs}/>
                </Grid>
            );
            //console.log('potential JA for altWinner ', altWinner,potentialJudgAcceptability[winner])

        }
        return acceptabilities;
    };

    return (
        <Grid container spacing={2} size={12}>
            {potentialJudgAcceptability.length > 0  &&(
                <Grid container spacing={2} size={12}>
                {generateAcceptabilites()}
            </Grid>
            )}

            {potentialJudgementEntropy.length>0 &&(
                <Grid container spacing={2} size={12}>
                    <PotentialJudgementEntropyDataGrid judgementMultiInputs={judgMultiInputs} potJudgEntropy={potentialJudgementEntropy}/>
            </Grid>
            )}

        </Grid>
    )
}
// need kMonteCarlo, judg inputs, judg circumstance counter
export type JudgementProps = {
    kMonteCarlo: number;
    judgCircumstanceCounter: number[][][][]; // [altWinner][crit][alt][judgCounter]
    judgMultiInputs: number[][][]; // [crit][alt][judgIdx]
}