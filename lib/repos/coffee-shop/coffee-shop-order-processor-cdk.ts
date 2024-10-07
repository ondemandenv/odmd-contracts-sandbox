import {
    OdmdBuild,
    OdmdCrossRefConsumer,
    OdmdEnverCdk,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {CoffeeShopFoundationEnver} from "./coffee-shop-foundation-cdk";

export class CoffeeShopOrderProcessorEnver extends OdmdEnverCdk {
    constructor(owner: CoffeeShopOrderProcessorCdk, targetAWSAccountID: string,
                targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);


        const foundationCdk = owner.contracts.coffeeShopFoundationCdk.theOne;
        this.eventBus = new OdmdCrossRefConsumer(this, 'eventBus', foundationCdk.eventBusSrc);
        this.eventSrc = new OdmdCrossRefConsumer(this, 'eventSrc', foundationCdk.eventBusSrc.source);
        this.configTableName = new OdmdCrossRefConsumer(this, 'configTableName', foundationCdk.configTableName);
        this.countTableName = new OdmdCrossRefConsumer(this, 'countTableName', foundationCdk.countTableName);
    }

    readonly eventBus: OdmdCrossRefConsumer<CoffeeShopOrderProcessorEnver, CoffeeShopFoundationEnver>;
    readonly eventSrc: OdmdCrossRefConsumer<CoffeeShopOrderProcessorEnver, CoffeeShopFoundationEnver>;
    readonly configTableName: OdmdCrossRefConsumer<CoffeeShopOrderProcessorEnver, CoffeeShopFoundationEnver>;
    readonly countTableName: OdmdCrossRefConsumer<CoffeeShopOrderProcessorEnver, CoffeeShopFoundationEnver>;

}

export class CoffeeShopOrderProcessorCdk extends OdmdBuild<OdmdEnverCdk> {

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