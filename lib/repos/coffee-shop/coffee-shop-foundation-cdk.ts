import {
    OdmdBuild,
    OdmdCrossRefProducer,
    OdmdEnverCdk,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";

export class EvBusSrcRefProducer extends OdmdCrossRefProducer<CoffeeShopFoundationEnver> {

    constructor(owner: CoffeeShopFoundationEnver, id: string) {
        super(owner, id, {
            children: [{pathPart: 'ev-src'}]
        });
    }

    public get source() {
        return this.children![0]!
    }
}

export class CoffeeShopFoundationEnver extends OdmdEnverCdk {
    constructor(owner: OdmdBuild<OdmdEnverCdk>, targetAWSAccountID: string,
                targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);
        this.eventBusSrc = new EvBusSrcRefProducer(this, 'bus-src')
        this.configTableName = new EvBusSrcRefProducer(this, 'config-table')
        this.countTableName = new EvBusSrcRefProducer(this, 'count-table')
    }

    readonly eventBusSrc: EvBusSrcRefProducer;
    readonly configTableName: OdmdCrossRefProducer<CoffeeShopFoundationEnver>;
    readonly countTableName: OdmdCrossRefProducer<CoffeeShopFoundationEnver>;

}

export class CoffeeShopFoundationCdk extends OdmdBuild<OdmdEnverCdk> {
    private _envers: Array<CoffeeShopFoundationEnver>;
    get envers(): Array<CoffeeShopFoundationEnver> {
        return this._envers;
    }

    private _theOne: CoffeeShopFoundationEnver;
    get theOne(): CoffeeShopFoundationEnver {
        return this._theOne;
    }

    ownerEmail?: string | undefined;

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'coffee-shop-foundation', scope.githubRepos.CoffeeShopFoundationCdk);
    }

    protected initializeEnvers(): void {
        this._theOne = new CoffeeShopFoundationEnver(this, this.contracts.accounts.workspace1, 'us-west-1',
            new SRC_Rev_REF('b', 'master'));
        this._envers = [this._theOne];
    }

    get contracts(): OndemandContractsSandbox {
        return super.contracts as OndemandContractsSandbox;
    }
}