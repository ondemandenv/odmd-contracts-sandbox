import {
    ContractsBuild,
    ContractsCrossRefConsumer,
    ContractsEnverCdk,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {CoffeeShopFoundationEnver} from "./coffee-shop-foundation-cdk";
import {Construct} from "constructs";

export class CoffeeShopOrderManagerEnver extends ContractsEnverCdk {
    constructor(owner: ContractsBuild<ContractsEnverCdk>, targetAWSAccountID: string,
                targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);


        const foundationCdk = OndemandContractsSandbox.myInst.coffeeShopFoundationCdk.theOne;
        this.eventBus = new ContractsCrossRefConsumer(this, 'eventBus', foundationCdk.eventBusSrc);
        this.eventSrc = new ContractsCrossRefConsumer(this, 'eventSrc', foundationCdk.eventBusSrc.source);
        this.configTableName = new ContractsCrossRefConsumer(this, 'configTableName', foundationCdk.configTableName);
        this.countTableName = new ContractsCrossRefConsumer(this, 'countTableName', foundationCdk.countTableName);

        this.preCdkCmds.push('npm --prefix lib/onWorkflowStarted install')
    }

    readonly eventBus: ContractsCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;
    readonly eventSrc: ContractsCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;
    readonly configTableName: ContractsCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;
    readonly countTableName: ContractsCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;

}

export class CoffeeShopOrderManagerCdk extends ContractsBuild<ContractsEnverCdk> {

    readonly envers: Array<CoffeeShopOrderManagerEnver>


    gitHubRepo = OndemandContractsSandbox.myInst.githubRepos.CoffeeShopOrderManagerCdk
    ownerEmail?: string | undefined;

    constructor(scope: Construct) {
        super(scope, 'coffeeShopOrderManager');
        const coffeeF = OndemandContractsSandbox.myInst.coffeeShopFoundationCdk.theOne
        this.envers = [new CoffeeShopOrderManagerEnver(this, coffeeF.targetAWSAccountID, coffeeF.targetAWSRegion,
            new SRC_Rev_REF('b', 'master'))]
    }

}