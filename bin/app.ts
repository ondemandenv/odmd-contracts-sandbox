#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {OndemandContractsSandbox} from "../lib/OndemandContractsSandbox";
import {Stack} from "aws-cdk-lib";
import {AnyOdmdEnVer} from "@ondemandenv/contracts-lib-base";


const app = new cdk.App({autoSynth: false});

async function main() {

    const buildRegion = process.env.CDK_DEFAULT_REGION;
    const buildAccount = process.env.CDK_DEFAULT_ACCOUNT;
    if (!buildRegion || !buildAccount) {
        throw new Error("buildRegion>" + buildRegion + "; buildAccount>" + buildAccount)
    }

    new OndemandContractsSandbox(app)
    new Stack(app, 'dummy')
    const csa = app.synth();

    let contractsInst = OndemandContractsSandbox.inst;
    const targetEnver = contractsInst.getTargetEnver('sampleSpringOpenAPI3cdk', 'b..master' ) as AnyOdmdEnVer

    console.log("targetEnver>" + targetEnver)


}


console.log("main begin.")
main().catch(e => {
    console.error(e)
    throw e
}).finally(() => {
    console.log("main end.")
})