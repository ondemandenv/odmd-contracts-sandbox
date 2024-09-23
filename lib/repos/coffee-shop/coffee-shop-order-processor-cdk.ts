import {
    ContractsBuild,
    ContractsCrossRefConsumer,
    ContractsEnverCdk,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {CoffeeShopFoundationEnver} from "./coffee-shop-foundation-cdk";

export class CoffeeShopOrderProcessorEnver extends ContractsEnverCdk {
    constructor(owner: CoffeeShopOrderProcessorCdk, targetAWSAccountID: string,
                targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);


        const foundationCdk = owner.contracts.coffeeShopFoundationCdk.theOne;
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

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'coffeeShopOrderProcessor', scope.githubRepos.CoffeeShopOrderProcessorCdk);
        const coffeeF = scope.coffeeShopFoundationCdk.theOne
        this.envers = [new CoffeeShopOrderProcessorEnver(this, coffeeF.targetAWSAccountID, coffeeF.targetAWSRegion,
            new SRC_Rev_REF('b', 'master'))]
    }
    get contracts(): OndemandContractsSandbox {
        return super.contracts as OndemandContractsSandbox;
    }

}