import {
    ContractsBuild,
    ContractsCrossRefConsumer,
    ContractsEnverCdk,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {CoffeeShopFoundationEnver} from "./coffee-shop-foundation-cdk";
import {Construct} from "constructs";

export class CoffeeShopOrderProcessorEnver extends ContractsEnverCdk {
    constructor(owner: ContractsBuild<ContractsEnverCdk>, targetAWSAccountID: string,
                targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);


        const foundationCdk = OndemandContractsSandbox.myInst.coffeeShopFoundationCdk.theOne;
        this.eventBus = new ContractsCrossRefConsumer(this, 'eventBus', foundationCdk.eventBusSrc);
        this.eventSrc = new ContractsCrossRefConsumer(this, 'eventSrc', foundationCdk.eventBusSrc.source);
        this.configTableName = new ContractsCrossRefConsumer(this, 'configTableName', foundationCdk.configTableName);
        this.countTableName = new ContractsCrossRefConsumer(this, 'countTableName', foundationCdk.countTableName);
    }

    readonly eventBus: ContractsCrossRefConsumer<CoffeeShopOrderProcessorEnver, CoffeeShopFoundationEnver>;
    readonly eventSrc: ContractsCrossRefConsumer<CoffeeShopOrderProcessorEnver, CoffeeShopFoundationEnver>;
    readonly configTableName: ContractsCrossRefConsumer<CoffeeShopOrderProcessorEnver, CoffeeShopFoundationEnver>;
    readonly countTableName: ContractsCrossRefConsumer<CoffeeShopOrderProcessorEnver, CoffeeShopFoundationEnver>;

}

export class CoffeeShopOrderProcessorCdk extends ContractsBuild<ContractsEnverCdk> {

    public readonly WORKFLOW_STARTED = 'OrderProcessor.WorkflowStarted'

    public readonly envers: Array<CoffeeShopOrderProcessorEnver>

    ownerEmail?: string | undefined;

    constructor(scope: Construct) {
        super(scope, 'coffeeShopOrderProcessor', OndemandContractsSandbox.myInst.githubRepos.CoffeeShopOrderProcessorCdk);
        const coffeeF = OndemandContractsSandbox.myInst.coffeeShopFoundationCdk.theOne
        this.envers = [new CoffeeShopOrderProcessorEnver(this, coffeeF.targetAWSAccountID, coffeeF.targetAWSRegion,
            new SRC_Rev_REF('b', 'master'))]
    }

}