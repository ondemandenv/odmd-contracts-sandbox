import {
    OdmdBuild,
    OdmdCrossRefConsumer,
    OdmdEnverCdk,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {CoffeeShopFoundationEnver} from "./coffee-shop-foundation-cdk";

export class CoffeeShopOrderManagerEnver extends OdmdEnverCdk {
    constructor(owner: CoffeeShopOrderManagerCdk, targetAWSAccountID: string,
                targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);


        const foundationCdk = owner.contracts.coffeeShopFoundationCdk.theOne;
        this.eventBus = new OdmdCrossRefConsumer(this, 'eventBus', foundationCdk.eventBusSrc);
        this.eventSrc = new OdmdCrossRefConsumer(this, 'eventSrc', foundationCdk.eventBusSrc.source);
        this.configTableName = new OdmdCrossRefConsumer(this, 'configTableName', foundationCdk.configTableName);
        this.countTableName = new OdmdCrossRefConsumer(this, 'countTableName', foundationCdk.countTableName);

        this.preCdkCmds.push('npm --prefix lib/onWorkflowStarted install')
    }

    readonly eventBus: OdmdCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;
    readonly eventSrc: OdmdCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;
    readonly configTableName: OdmdCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;
    readonly countTableName: OdmdCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;

}

export class CoffeeShopOrderManagerCdk extends OdmdBuild<OdmdEnverCdk> {

    readonly envers: Array<CoffeeShopOrderManagerEnver>


    ownerEmail?: string | undefined;

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'coffeeShopOrderManager', scope.githubRepos.CoffeeShopOrderManagerCdk);
        const coffeeF = scope.coffeeShopFoundationCdk.theOne
        this.envers = [new CoffeeShopOrderManagerEnver(this, coffeeF.targetAWSAccountID, coffeeF.targetAWSRegion,
            new SRC_Rev_REF('b', 'master'))]
    }


    get contracts(): OndemandContractsSandbox {
        return super.contracts as OndemandContractsSandbox;
    }
}