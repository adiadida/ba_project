import {Grid} from "@mui/material";
import {PotentialPreferenceEntropyDataGrid} from "@/components/cmaa/PotentialPreferenceEntropyDataGrid";
import {useEffect, useState} from "react";
import {PreferenceAcceptabilityDataGrid} from "@/components/cmaa/PreferenceAcceptabilityDataGrid";

export const PreferenceAcceptabilitiesAndEntropy = ({
                                                        kMonteCarlo,
                                                        prefCircumstanceCounter,
                                                        prefsMultiInputs
                                                    }: PreferenceProps) => {

    // state management
    const [currentPrefAcceptability, setCurrentPrefAcceptability] = useState<number[][][]>([]);
    const [potentialPrefAcceptability, setPotentialPrefAcceptability] = useState<number[][][]>([]);
    const [preferenceEntropy, setPreferenceEntropy] = useState<number[][]>([]);

    const initializePrefAcceptability = () => {

        let prefAcceptability: number[][][] = [];

        // console.log('pref circ c:',prefCircumstanceCounter);
        // console.log('num Alts', prefCircumstanceCounter.length);
        // console.log('num criteria', prefCircumstanceCounter[0].length);
        // console.log('pref idx', prefCircumstanceCounter[0][0].length);

        for (let altWinner = 0; altWinner < prefCircumstanceCounter.length; altWinner++) {
            prefAcceptability[altWinner] = [];

            for (let crit = 0; crit < prefCircumstanceCounter[altWinner].length; crit++) {
                prefAcceptability[altWinner][crit] = [];

                for (let prefIdx = 0; prefIdx < prefCircumstanceCounter[altWinner][crit].length; prefIdx++) {
                    prefAcceptability[altWinner][crit][prefIdx] = 0;
                }
            }
        }

        return prefAcceptability;
    }

    // compute current pref acceptability (= preferenceCounter/k)
    // calculates current acceptability by normalizing counts over kMonteCarlo
    // -> becomes probability/distribution
    function computeCurrentPrefAcceptability() {

        let currentPrefAcceptability = initializePrefAcceptability();

        for (let altWinner = 0; altWinner < prefCircumstanceCounter.length; altWinner++) {

            for (let crit = 0; crit < prefCircumstanceCounter[altWinner].length; crit++) {

                for (let prefIdx = 0; prefIdx < prefCircumstanceCounter[altWinner][crit].length; prefIdx++) {
                    currentPrefAcceptability[altWinner][crit][prefIdx] = prefCircumstanceCounter[altWinner][crit][prefIdx] / kMonteCarlo;
                }
            }
        }

        return currentPrefAcceptability;
    }

    // compute potential preference acceptability (for each pot preference acceptability sum up that preference acceptability from each aWinner and compute pot preference acc/sum)
    // normalizes current acceptability across alternatives for each preference
    // -> normalized probability/distribution
    function computePotentialPrefAcceptability(currPrefAcceptability: number[][][]) {

        const currPrefAcc = currPrefAcceptability;
        let potentialPrefAcceptability = initializePrefAcceptability();


        // error handling
        if (isNaN(currPrefAcc[0][0][0]) || !isFinite(currPrefAcc[0][0][0])) {
            console.log('potential preference acceptability is NaN or infinity');
            return potentialPrefAcceptability;
        }


        /*let sums = initializePreferenceEntropy(); // is 2-dim array
        // sum up current potential acceptability over all altWinners
        for (let crit = 0; crit < sums.length; crit++) {
            for (let prefIdx = 0; prefIdx < sums[crit].length; prefIdx++) {

            }
        }*/

        for (let altWinner = 0; altWinner < prefCircumstanceCounter.length; altWinner++) {

            for (let crit = 0; crit < prefCircumstanceCounter[altWinner].length; crit++) {

                for (let prefIdx = 0; prefIdx < prefCircumstanceCounter[altWinner][crit].length; prefIdx++) {

                    // sum for normalization
                    let sum = 0;
                    for (let alt = 0; alt < prefCircumstanceCounter.length; alt++) {
                        sum += currPrefAcc[alt][crit][prefIdx];
                    }

                    potentialPrefAcceptability[altWinner][crit][prefIdx] = currPrefAcc[altWinner][crit][prefIdx] / sum;
                }
            }
        }

        return potentialPrefAcceptability;
    }

    const initializePreferenceEntropy = () => {
        let prefEntropy: number[][] = [];

        for (let crit = 0; crit < prefsMultiInputs.length; crit++) {
            prefEntropy[crit] = [];
            for (let prefIdx = 0; prefIdx < prefsMultiInputs[crit].length; prefIdx++) {
                prefEntropy[crit][prefIdx] = 0;
            }
        }

        return prefEntropy;
    }

    // loop over potential pref acceptability and compute preference entropy
    // calculates Shannon entropy for the potential preference acceptability distributions
    function computePreferenceEntropy(potPrefAcceptability: number[][][]) {
        const potPrefAcc = potPrefAcceptability;
        let preferenceEntropy: number[][] = initializePreferenceEntropy();


        for (let crit = 0; crit < prefsMultiInputs.length; crit++) {

            for (let prefIdx = 0; prefIdx < prefsMultiInputs[crit].length; prefIdx++) {

                let sumPotPref = 0;
                for (let altWinner = 0; altWinner < prefCircumstanceCounter.length; altWinner++) {
                    sumPotPref += potPrefAcc[altWinner][crit][prefIdx];
                }

                // Compute entropy for this criterion and preference index
                let entropy = 0;
                if (sumPotPref > 0) {
                    for (let altWinner = 0; altWinner < prefCircumstanceCounter.length; altWinner++) {
                        const p = potPrefAcc[altWinner][crit][prefIdx] / sumPotPref;
                        if (p > 0) {
                            entropy -= p * Math.log2(p);
                        }
                    }
                }
                preferenceEntropy[crit][prefIdx] = entropy;
            }
        }
        return preferenceEntropy;
    }


    useEffect(() => {

        if (prefCircumstanceCounter[0][0][0] !== undefined && !isNaN(prefCircumstanceCounter[0][0][0]) && prefsMultiInputs[0][0] !== undefined) { // error handling

            const currPrefAcc = computeCurrentPrefAcceptability();
            //console.log('current ', currPrefAcc);

            if (!isNaN(currPrefAcc[0][0][0]) && isFinite(currPrefAcc[0][0][0])) { // error handling
                setCurrentPrefAcceptability(currPrefAcc);
                const potPrefAcc = computePotentialPrefAcceptability(currPrefAcc);
                //console.log('potential', potPrefAcc)
                setPotentialPrefAcceptability(potPrefAcc);
                const prefEntropy = computePreferenceEntropy(potPrefAcc);
                setPreferenceEntropy(prefEntropy);
                //console.log('pot pref entr: ', prefEntropy);
            }

        }


    }, [kMonteCarlo, prefCircumstanceCounter, prefsMultiInputs]);

    // check if in range
    const isBetween = (x: number, min: number, max: number) => {
        return x >= min && x <= max;
    };

    // sum of [crit][prefidx] over altWinner should be 1
    function checkPotPrefAcceptability() {

        // error handling
        if (isNaN(potentialPrefAcceptability[0][0][0]) || !isFinite(potentialPrefAcceptability[0][0][0])) {
            return;
        }

        for (let altWinner = 0; altWinner < prefCircumstanceCounter.length; altWinner++) {

            for (let crit = 0; crit < prefCircumstanceCounter[altWinner].length; crit++) {

                for (let prefIdx = 0; prefIdx < prefCircumstanceCounter[altWinner][crit].length; prefIdx++) {

                    // sum for normalization
                    let sum = 0;
                    for (let alt = 0; alt < prefCircumstanceCounter.length; alt++) {
                        sum += potentialPrefAcceptability[alt][crit][prefIdx];
                    }

                    if (!isBetween(sum, 1 - 0.1, 1 + 0.1)) {
                        console.log('potPrefAcc Check failed at [alt][crit][prefIdx] ', altWinner, crit, prefIdx);
                        console.log('sum', sum);
                    }
                }
            }
        }
    }

    // unit test
    useEffect(() => {
        if (potentialPrefAcceptability && potentialPrefAcceptability.length > 0 && potentialPrefAcceptability[0][0][0] !== undefined) {
            checkPotPrefAcceptability();
        }
    }, [potentialPrefAcceptability]);

    // Generate an array of React elements representing the acceptabilities
    const generateAcceptabilites = () => {
        const acceptabilities = [];
        for (let winner = 0; winner < prefCircumstanceCounter.length; winner++) {
            const altWinner = winner + 1;
            acceptabilities.push(
                <Grid key={`currAltWinner${winner}`}>
                    <PreferenceAcceptabilityDataGrid isCurrent={true} altWinner={altWinner}
                                                     preferenceAcceptability={currentPrefAcceptability[winner]}
                                                     preferenceMultiInputs={prefsMultiInputs}/>
                </Grid>
            );
            //console.log('current PA for altWinner ', altWinner,currentPrefAcceptability[winner])
            acceptabilities.push(
                <Grid key={`potAltWinner${winner}`}>
                    <PreferenceAcceptabilityDataGrid isCurrent={false} altWinner={altWinner}
                                                     preferenceAcceptability={potentialPrefAcceptability[winner]}
                                                     preferenceMultiInputs={prefsMultiInputs}/>
                </Grid>
            );
            //console.log('potential PA for altWinner ', altWinner,potentialPrefAcceptability[winner])

        }
        return acceptabilities;
    };

    return (<Grid container spacing={2} size={12}>
        <Grid container spacing={2} size={6}>

            {generateAcceptabilites()}

        </Grid>
        <Grid container spacing={2} size={6}>
            <PotentialPreferenceEntropyDataGrid prefsMultiInputs={prefsMultiInputs}
                                                potPrefsEntropy={preferenceEntropy}/>
        </Grid>
    </Grid>)
}

// need pref counter, k, pref inputs
type PreferenceProps = {
    kMonteCarlo: number;
    prefCircumstanceCounter: number[][][]; // prefCircumstanceCounter[altWinner][criterion][preferenceCounter]
    prefsMultiInputs: number[][]; // prefsMultiInputs[criterion][preference]
}

// todo: useEffect with Unit Test
// todo: vis with heatmap over prefs