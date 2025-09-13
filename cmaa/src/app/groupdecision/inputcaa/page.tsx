'use client'

import {GenericHeader} from "@/components/generics/GenericHeader";
import {useSearchParams} from "next/navigation"; // useRouter hook should be imported from next/navigation
import React, {useEffect, useRef, useState} from "react";
import {Grid} from "@mui/material";
import seedrandom from "seedrandom";
import {testData} from "@/components/cmaa/TestData";
import {StatisticsAccordion} from "@/components/cmaa/StatisticsAccordion";
import {ClarificationInputs} from "@/components/clarificationConference/ClarificationInputs";
import {Recommendations} from "@/components/recommendations/Recommendations";
import {MetricsGrid} from "@/components/discussionMetrics/MetricsGrid";
import {GenericAccordion} from "@/components/generics/GenericAccordion";
import {Divider} from "@mui/material";


export default function CAAPage() {

    // to get and store data
    const [decisionMakerData, setDecisionMakerData] = useState<{ [oid: string]: any }>({});
    const searchParams = useSearchParams()

    // State to hold aggregated preferences
    const [aggregatedPreferences, setAggregatedPreferences] = useState<Set<number>[]>([]);

    // State to hold aggregated judgements
    const [aggregatedJudgements, setAggregatedJudgements] = useState<Set<number>[][]>([]);

    // State to hold rank acceptability counter
    const [rankAcceptabilityCounter, setRankAcceptabilityCounter] = useState<number[][]>([]);
    // State to hold rank acceptability indices
    const [rankAcceptabilityIndices, setRankAcceptabilityIndices] = useState<number[][]>([]);

    // state for preference multimatrix
    const [preferencesMultiInputs, setPreferencesMultiInputs] = useState<number[][]>([]);

    // Ref for counter multimatrix - [a_i gewinne] [kriterienindex] [bewertungsindex]
    // preferenceCircumstanceCounter
    const preferencesCircumstanceCounterRef = useRef<number[][][] | null>(null);

    // state for judgement multimatrix
    const [judgementsMultiInputs, setJudgementsMultiInputs] = useState<number[][][]>([]);

    // Ref for counter multimatrix - [a_i gewinne] [kriterienindex] [alternativenindex] [bewertungsindex]
    // judgementCircumstanceCounter
    const judgementsCircumstanceCounterRef = useRef<number[][][][] | null>(null);

    // --- for user feedback ---
    // count number of clarification conferences
    const [stepCounter, setStepCounter] = useState<number>(0);
    const [alternativeWinner, setAlternativeWinner] = useState<number>(0);
    const [chanceWinner, setChanceWinner] = useState<number>(0);

    //for debugging
    const dPrefsRef = useRef<number[][] | null>(null);
    const dJudgesRef = useRef<number[][][] | null>(null);

    // updating MultiInputs triggered by user input
    const [editedPrefs, setEditedPrefs] = useState<number[][]>([]);
    const [editedJudgements, setEditedJudgements] = useState<number[][][]>([]);
    const handlePreferenceChange = (newPrefs: number[][]) => setEditedPrefs(newPrefs);
    const handleJudgementChange = (newJudgements: number[][][]) => setEditedJudgements(newJudgements);

    // compute data for first render
    useEffect(() => {

        // init RNG
        // use randomNumberGenerator with uniform chance for Monte Carlo simulations
        initializeGenerator(/*'4321'*/);

        // get initial input data
        let decisionMakerData = getDecisionMakerData(searchParams);

        // initialize some matrices
        let {
            aggregatedJudgements,
            aggregatedPreferences,
            rankAcceptabilityIndices,
            rankAcceptabilityCounter
        } = initPageStateData(decisionMakerData);

        // initialize MultiInputs
        const {
            preferencesMultiInputs,
            judgementsMultiInputs
        } = getMultiData(aggregatedPreferences, aggregatedJudgements);

        // initialize circumstance counters
        let {
            preferencesCircumstanceCounter,
            judgementsCircumstanceCounter
        } = getInitialCircCounters(aggregatedPreferences, aggregatedJudgements);

        // for UI
        let winner: number;
        let chance: number;

        // execute CMAA algorithm when all input parameters are properly set
        ({
            winner,
            chance,
            rankAcceptabilityIndices,
            preferencesCircumstanceCounter,
            judgementsCircumstanceCounter,
            rankAcceptabilityCounter
        } = cMAA(
            aggregatedJudgements,
            aggregatedPreferences,
            rankAcceptabilityCounter,
            rankAcceptabilityIndices,
            preferencesCircumstanceCounter,
            judgementsCircumstanceCounter,
            preferencesMultiInputs,
            judgementsMultiInputs,
            decisionMakerData
        ));

        setAggregatedPreferences(aggregatedPreferences);
        setAggregatedJudgements(aggregatedJudgements);
        setRankAcceptabilityCounter(rankAcceptabilityCounter);
        setRankAcceptabilityIndices(rankAcceptabilityIndices);
        setPreferencesMultiInputs(preferencesMultiInputs);
        setJudgementsMultiInputs(judgementsMultiInputs);
        preferencesCircumstanceCounterRef.current = preferencesCircumstanceCounter;
        judgementsCircumstanceCounterRef.current = judgementsCircumstanceCounter;
        setAlternativeWinner(winner);
        setChanceWinner(chance);
        setEditedPrefs(preferencesMultiInputs);
        setEditedJudgements(judgementsMultiInputs);

    }, [searchParams]);

    // function that generates aggregations of decisionMakerData
    // Run aggregation whenever decisionMakerData updates
    // doesn't run in case: setting new MultiInputs from Input DataGrids
    useEffect(() => {
        const aggPrefs: Set<number>[] = aggPreferences(decisionMakerData);
        setAggregatedPreferences(aggPrefs);
        //console.log('Aggregated Preferences:', aggPrefs);

        const aggJudgs: Set<number>[][] = aggJudgements(decisionMakerData);
        setAggregatedJudgements(aggJudgs);
        //console.log('Aggregated Judgements:', aggJudgs);

        const initialRACounter: number [][] = initializeRankAcceptabilityMatrix(decisionMakerData);
        setRankAcceptabilityCounter(initialRACounter);
        //console.log('Initial RAC:', initialRACounter);

        const initialRAIndices: number [][] = initializeRankAcceptabilityMatrix(decisionMakerData);
        setRankAcceptabilityIndices(initialRAIndices);
        //console.log('Initial RAI:', initialRACounter);

    }, [decisionMakerData]);

        return {
            aggregatedPreferences: aggPrefs,
            aggregatedJudgements: aggJudgs,
            rankAcceptabilityCounter: initialRACounter,
            rankAcceptabilityIndices: initialRAIndices
        };
    }

       // --- getting updated data and re-triggering cmaa
    const handleResend = () => {

        let decisionMakerData = getDecisionMakerData(searchParams);

        // initialize rank acceptability matrices
        let {
            rankAcceptabilityIndices,
            rankAcceptabilityCounter
        } = initPageStateData(decisionMakerData);

        // get aggregated inputs from edited inputs
        const aggregatedPreferences: Set<number>[] = reduceMultiPreferences(editedPrefs);
        const aggregatedJudgements: Set<number>[][] = reduceMultiJudgements(editedJudgements);

        // create multi inputs from aggregated inputs
        const {
            preferencesMultiInputs,
            judgementsMultiInputs
        } = getMultiData(aggregatedPreferences, aggregatedJudgements);

        // initialize circumstance counters
        let {
            preferencesCircumstanceCounter,
            judgementsCircumstanceCounter
        } = getInitialCircCounters(preferencesMultiInputs, aggregatedJudgements);

        // information for UI
        let winner: number;
        let chance: number;

        // execute CMAA algorithm when all input parameters are properly set
        ({
            winner,
            chance,
            rankAcceptabilityIndices,
            preferencesCircumstanceCounter,
            judgementsCircumstanceCounter,
            rankAcceptabilityCounter
        } = cMAA(
            aggregatedJudgements,
            aggregatedPreferences,
            rankAcceptabilityCounter,
            rankAcceptabilityIndices,
            preferencesCircumstanceCounter,
            judgementsCircumstanceCounter,
            preferencesMultiInputs,
            judgementsMultiInputs,
            decisionMakerData
        ));

        // setter
        setAggregatedPreferences(aggregatedPreferences);
        setAggregatedJudgements(aggregatedJudgements);
        setRankAcceptabilityCounter(rankAcceptabilityCounter);
        setRankAcceptabilityIndices(rankAcceptabilityIndices);
        setPreferencesMultiInputs(preferencesMultiInputs);
        setJudgementsMultiInputs(judgementsMultiInputs);
        preferencesCircumstanceCounterRef.current = preferencesCircumstanceCounter;
        judgementsCircumstanceCounterRef.current = judgementsCircumstanceCounter;
        setAlternativeWinner(winner);
        setChanceWinner(chance);

        // update stepCounter for number of clarification conferences
        setStepCounter(stepCounter + 1);
    };

    // --- Seeded RNG ---

    // UseRef to hold the seedrandom generator instance
    const rngRef = useRef<seedrandom.PRNG | null>(null);

    // Initialize the seedrandom generator once
    const initializeGenerator = (seed?: string) => {
        //fallback seed
        const superSeed: string = seed ?? 'bombastic1234whydontyouworkthisisveryweirdnosenseforthesenseless';
        rngRef.current = seedrandom(superSeed);
    };

    // Generate random number isBetween 0 and 1
    const getRandomNumber = (): number => {
        if (rngRef.current) {
            return rngRef.current();
        }
        // Fallback if RNG isn't initialized
        console.warn('RNG not initialized!');
        return Math.random(); // fallback to Math.random() as a safe default
    };

    React.useEffect(() => {
        initializeGenerator(/*'4321'*/); // CHANGE SEED HERE
    }, []);

    // --- Generate Random Instance ---
    const generateRandomInstance = (aggrPreferences: Set<number>[], aggrJudgements: Set<number>[][], seed?: string) => {
        // Initialize generator if seed provided (rng already initialized otherwise)
        if (seed) {
            initializeGenerator(seed);
        }

        // for debugging - test uniformity
        //const dPrefs = dPrefsRef.current!;
        //const dJudges = dJudgesRef.current!;

        let preferences: number[] = [];

        // initiate preference array
        for (let i = 0; i < aggrPreferences.length; i++) {
            preferences[i] = 0;
        }

        //generate numbers from existing weights
        for (let i = 0; i < preferences.length; i++) {
            const cellWeights: number[] = Array.from(aggrPreferences[i]);
            const randIdx = Math.floor(getRandomNumber() * cellWeights.length);
            preferences[i] = cellWeights[randIdx];

            //for debugging
            //dPrefs[i][randIdx] += 1;

        }

        // initiate judgments matrix
        let judgements: number[][] = [];
        for (let i = 0; i < aggrJudgements.length; i++) {
            judgements[i] = [];
            for (let j = 0; j < aggrJudgements[i].length; j++) {
                judgements[i][j] = 0;
            }
        }

        // generate values from existing sets
        for (let i = 0; i < aggrJudgements.length; i++) { // iterate over criteria
            const row = aggrJudgements[i];
            for (let j = 0; j < aggrJudgements[i].length; j++) { // iterate over alternatives
                const cellJudgements: number[] = Array.from(row[j]);

                // index in range of numbers from set
                const randIdx: number = Math.floor(getRandomNumber() * cellJudgements.length);
                judgements[i][j] = cellJudgements[randIdx];
                //dJudges[i][j][randIdx] += 1;
            }
        }
        // update debugging counters
        //dPrefsRef.current = dPrefs;
        //dJudgesRef.current = dJudges;

        return {preferences, judgements};
    }

    const createStatistics = (rankAcceptabilityCounter: number[][], kCM: number) => {
        const counterMatrix = rankAcceptabilityCounter;
        const rAIMatrix = initializeRankAcceptabilityMatrix(decisionMakerData);

        // iterate over 1 col and rows + sum up number of instances
        /*let sum = 0;
        for (let j = 0; j < counterMatrix[0].length; j++) {
            sum += counterMatrix[0][j];
        }
        */

        // normalize counters with sum of instances
        for (let i = 0; i < rAIMatrix.length; i++) {
            for (let j = 0; j < rAIMatrix[i].length; j++) {
                rAIMatrix[i][j] = counterMatrix[i][j] / kCM;
            }
        }

        //console.log('normalized: ', rAIMatrix)
        setRankAcceptabilityIndices(rAIMatrix);

        // set winner and chance of winner (needed for user feedback) in ExitModal
        const getWinnerAndChance = () => {

            var winner: number = -1;
            var chance: number = -1;

            const rankOne = rAIMatrix[0]

            for (let i = 0; i < rankOne.length; i++) {
                if (chance < rankOne[i]) {
                    chance = rankOne[i];
                    winner = i + 1;
                }
            }

            chance = Math.round(chance * 100);
            return {winner, chance};
        }

        const {winner, chance} = getWinnerAndChance();

        setAlternativeWinner(winner);
        setChanceWinner(chance);

        console.log('statistics');
    }

    function cMAA() {

        // error handling
        if (Object.values(decisionMakerData).length === 0 || aggregatedJudgements.length === 0 || aggregatedPreferences.length === 0) {
            return;
        }

        // counters to get conditions for rank 1 from instances
        let preferencesCircumstanceCounter = _preferencesCircumstanceCounter;
        let judgementsCircumstanceCounter = _judgementsCircumstanceCounter;
        let rankAcceptabilityCounter = _rankAcceptabilityCounter;

        const kMonteCarlo = 10000;
        for (let k = 0; k < kMonteCarlo; k++) {
            const instance = generateRandomInstance(aggregatedPreferences, aggregatedJudgements);
            const ranks = generateRanking(instance.preferences, instance.judgements);
            updateCounters(instance.preferences, instance.judgements, ranks);
        }

        // for debugging
        //console.log('d prefs ', dPrefsRef.current);
        //console.log('d judges', dJudgesRef.current);

        const {
            winner,
            chance,
            rankAcceptabilityIndices
        } = createStatistics(rankAcceptabilityCounter, kMonteCarlo, decisionMakerData);
        //console.log('rankAcceptabilityCounter ', rankAcceptabilityCounter);
        console.log('rankAcceptabilityIndices ', rankAcceptabilityIndices);
    }

    // for debugging purposes
    const initializeDPrefs = () => {
        //for debugging - test uniformity
        let dPrefs: number[][] = []
        for (let i = 0; i < aggregatedPreferences.length; i++) {
            // for debugging
            const length = Array.from(aggregatedPreferences[i]).length ?? 1;
            dPrefs[i] = [];
            dPrefs[i] = Array(length).fill(0);
        }
        return dPrefs;
    }

    const initializeDJudges = () => {
        let dJudges: number[][][] = [];
        for (let i = 0; i < aggregatedJudgements.length; i++) {
            dJudges[i] = [];
            for (let j = 0; j < aggregatedJudgements[i].length; j++) {
                dJudges[i][j] = [];
                const length = Array.from(aggregatedJudgements[i][j]).length ?? 1;
                dJudges[i][j] = Array(length).fill(0);

            }
        }
        return dJudges;
    }

    // execute CMAA algorithm when all input parameters are properly set
    useEffect(() => {
        if ( // check if necessary data defined
            Object.keys(decisionMakerData) !== undefined &&
            aggregatedPreferences !== undefined &&
            aggregatedJudgements !== undefined &&
            aggregatedJudgements[0] !== undefined &&
            preferencesMultiInputs !== undefined &&
            judgementsMultiInputs !== undefined &&
            preferencesMultiInputs[0] !== undefined &&
            judgementsMultiInputs[0] !== undefined
            && preferencesMultiInputs.length > 0
            && judgementsMultiInputs.length > 0

        ) {

            //debugging
            //dPrefsRef.current = initializeDPrefs();
            //dJudgesRef.current = initializeDJudges();

            console.log('cmaa useEffect')

            cMAA()
            //console.log('judg count', judgementsCircumstanceCounterRef.current);
            //console.log('pref count', preferencesCircumstanceCounterRef.current);
        }
    }, [/*decisionMakerData, aggregatedPreferences, aggregatedJudgements,*/ preferencesMultiInputs, judgementsMultiInputs]);
// these dependencies are OR triggers --> caused multiple countings - now it triggers cmaa, statistics etc, but statistics dont update at all??

    // --- Checks ---
    /** unit testing
     // 1. each sum of row of judgements from alternatives = r1 of that altWinner
     // 2. each sum of row of preferences from criteria = r1 of that altWinner
     // 3. rai: sum of sums of rows = sum of sums of cols = number of alternatives


     // check if in range
     const isBetween = (x: number, min: number, max: number) => {
     return x >= min && x <= max;
     };

     function checkJudgements() {

     const errorMargin = 0;
     let checkSum = 0;
     let judgCounterSum = 0;
     // ! for error handling
     const judgCircCounter = judgementsCircumstanceCounterRef.current!;

     // error handling
     if (judgCircCounter === null) {
     return;
     }

     for (let altWinner = 0; altWinner < judgCircCounter.length; altWinner++) { // [a_i gewinne] // judgCircCounter[altWinner]

     checkSum = rankAcceptabilityCounter[altWinner][0]; // rank 1 is in first col - rAC[alts][ranks]

     for (let crit = 0; crit < judgCircCounter[altWinner].length; crit++) { // [kriterienindex] // judgCircCounter[altWinner][crit]

     for (let alt = 0; alt < judgCircCounter[altWinner][crit].length; alt++) { // [alternativenindex] // judgCircCounter[altWinner][crit][alt]

     // needs to be reset for the sum of judgements for each alternative
     judgCounterSum = 0;

     for (let judgeIdx = 0; judgeIdx < judgCircCounter[altWinner][crit][alt].length; judgeIdx++) { // [bewertungsindex] // judgCircCounter[altWinner][crit][alt][judgeIdx]
     judgCounterSum += judgCircCounter[altWinner][crit][alt][judgeIdx];
     }

     if (!isBetween(checkSum, judgCounterSum - errorMargin, judgCounterSum + errorMargin)) {
     console.log('Judgement Counter Check failed');
     console.log('check sum ', checkSum, ' judg sum ', judgCounterSum);
     }

     }
     }
     }
     }

     function checkPreferences() {

     const errorMargin = 0;
     let checkSum = 0;
     let prefCounterSum = 0;

     // ! for error handling
     const prefCircCounter = preferencesCircumstanceCounterRef.current!;

     // error handling
     if (prefCircCounter === null) {
     return;
     }

     for (let altWinner = 0; altWinner < prefCircCounter.length; altWinner++) { // [a_i gewinne] // prefCircCounter[altWinner]

     checkSum = rankAcceptabilityCounter[altWinner][0]; // rank 1 is in first col - rAC[alts][ranks]

     for (let crit = 0; crit < prefCircCounter[altWinner].length; crit++) { // [kriterienindex] // prefCircCounter[altWinner][crit]

     // needs to be reset for the sum of preferences for each criterion
     prefCounterSum = 0;

     for (let prefIdx = 0; prefIdx < prefCircCounter[altWinner][crit].length; prefIdx++) { // [bewertungsindex] // prefCircCounter[altWinner][crit][prefIdx]
     prefCounterSum += prefCircCounter[altWinner][crit][prefIdx];
     }

     if (!isBetween(prefCounterSum, checkSum - errorMargin, checkSum + errorMargin)) {
     console.log('Preference Counter Check failed');
     console.log('check sum ', checkSum, ' prefCounte sum ', prefCounterSum);
     }
     }
     }
     }

     function checkRAI() {

     const numAlts = rankAcceptabilityIndices.length;

     const errorMargin = 0.01;
     const negMarginNumAlts = numAlts - errorMargin;
     const posMarginNumAlts = numAlts + errorMargin;

     let ranksSum = 0;
     let altsSum = 0;

     // sum up rows/alternatives
     for (let alt = 0; alt < numAlts; alt++) {

     let altSum = 0;
     for (let rank = 0; rank < numAlts; rank++) {
     altSum += rankAcceptabilityIndices[alt][rank];
     altsSum += rankAcceptabilityIndices[alt][rank];
     }
     // each sum of row needs to be approx. 1
     if (!isBetween(altSum, 1 - errorMargin, 1 + errorMargin) && altSum !== 0) {
     console.log('RAI check failed');
     console.log('alternative sum ', altSum)
     }
     }

     // sum up columns/ranks
     for (let rank = 0; rank < numAlts; rank++) {

     for (let alt = 0; alt < numAlts; alt++) {
     ranksSum += rankAcceptabilityIndices[alt][rank];
     }
     }

     // error handling: case of only initialized matrix
     if (altsSum === 0 && ranksSum === 0) {
     return;
     }

     if (!isBetween(altsSum, negMarginNumAlts, posMarginNumAlts) || !isBetween(ranksSum, negMarginNumAlts, posMarginNumAlts)) {
     console.log('RAI check failed');
     console.log(numAlts, altsSum, ranksSum);
     }
     }

     // unit testing
     useEffect(() => {

     // error handling - data structures need to be initialized
     if (
     preferencesMultiInputs.length > 0
     && judgementsMultiInputs.length > 0
     && rankAcceptabilityCounter.length > 0
     && rankAcceptabilityIndices.length > 0
     && preferencesCircumstanceCounterRef.current!.length > 0
     && judgementsCircumstanceCounterRef.current!.length > 0
     ) {
     checkJudgements();
     checkPreferences();
     checkRAI();
     }

     }, [rankAcceptabilityCounter, preferencesCircumstanceCounterRef.current, judgementsCircumstanceCounterRef.current, rankAcceptabilityIndices])

     **/
    // --- UI Rendering ---
    return (
        <Grid container spacing={2} alignItems="center">
            <GenericHeader title="Gruppenentscheidung - Dashboard"/>

            <Grid container margin={4}>
                {rankAcceptabilityIndices.length > 0 &&
                    (
                        <Grid container size={12}>
                            <MetricsGrid rankAcceptabilityIndices={rankAcceptabilityIndices}
                                         conferenceCounter={stepCounter}
                                         alternativeWinner={alternativeWinner} chanceWinner={chanceWinner}/>
                        </Grid>

                    )}

                {aggregatedJudgements && aggregatedJudgements.length > 0 && aggregatedPreferences && aggregatedPreferences.length > 0 && (
                    <Recommendations
                        aggPrefs={aggregatedPreferences}
                        aggJudgements={aggregatedJudgements}
                    />
                )}

                <Grid container size={12} margin={1} alignItems={"center"}>
                {/*todo check why alternativeWinner and chanceWinner isnt always right*/}
                {judgementsMultiInputs.length > 0 && preferencesMultiInputs.length > 0 && (

                    <GenericAccordion title={'Schritt 2: Ergebnis der Konflikt-Klärung festhalten'} child={
                        <Grid container size={12}>
                            <ClarificationInputs conferenceCounter={stepCounter}
                                                 alternativeWinner={alternativeWinner} chanceWinner={chanceWinner}
                                                 handleResend={handleResend}
                                                 judgementMultiInputs={judgementsMultiInputs}
                                                 onJudgementChange={handleJudgementChange}
                                                 preferenceMultiInputs={preferencesMultiInputs}
                                                 onPreferenceChange={handlePreferenceChange}
                            />
                        </Grid>}
                    />

                )}
                    </Grid>

                <Grid container size={12} margin={1} alignItems={"center"}>

                    {
                        preferencesCircumstanceCounterRef.current &&
                        preferencesCircumstanceCounterRef.current.length > 0 &&

                        judgementsCircumstanceCounterRef.current &&
                        judgementsCircumstanceCounterRef.current.length > 0 &&
                        (
                            <StatisticsAccordion rankAcceptabilityIndices={rankAcceptabilityIndices}
                                                 rankAcceptabilityCounter={rankAcceptabilityCounter}
                                                 preferencesCircumstanceCounterRef={preferencesCircumstanceCounterRef.current!}
                                                 preferencesMultiInputs={preferencesMultiInputs}
                                                 judgementsCircumstanceCounterRef={judgementsCircumstanceCounterRef.current!}
                                                 judgementsMultiInputs={judgementsMultiInputs}/>
                        )}
                </Grid>

            </Grid>
        </Grid>
    );
}