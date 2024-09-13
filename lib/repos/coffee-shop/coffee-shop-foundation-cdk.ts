import {
    ContractsBuild,
    ContractsCrossRefProducer,
    ContractsEnverCdk,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {Construct} from "constructs";

export class EvBusSrcRefProducer extends ContractsCrossRefProducer<CoffeeShopFoundationEnver> {

    constructor(owner: CoffeeShopFoundationEnver, id: string) {
        super(owner, id, {
            children: [{pathPart: 'ev-src'}]
        });
    }

    public get source() {
        return this.children![0]!
    }
}

export class CoffeeShopFoundationEnver extends ContractsEnverCdk {
    constructor(owner: ContractsBuild<ContractsEnverCdk>, targetAWSAccountID: string,
                targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);
        this.eventBusSrc = new EvBusSrcRefProducer(this, 'bus-src')
        this.configTableName = new EvBusSrcRefProducer(this, 'config-table')
        this.countTableName = new EvBusSrcRefProducer(this, 'count-table')

        this.preCdkCmds.push('npm --prefix lib/initDynamo install')
    }

    readonly eventBusSrc: EvBusSrcRefProducer;
    readonly configTableName: ContractsCrossRefProducer<CoffeeShopFoundationEnver>;
    readonly countTableName: ContractsCrossRefProducer<CoffeeShopFoundationEnver>;

}

export class CoffeeShopFoundationCdk extends ContractsBuild<ContractsEnverCdk> {

    readonly envers: Array<CoffeeShopFoundationEnver>

    readonly theOne

    ownerEmail?: string | undefined;

    constructor(scope: Construct) {
        super(scope, 'coffee-shop-foundation', OndemandContractsSandbox.myInst.githubRepos.CoffeeShopFoundationCdk);
        this.theOne = new CoffeeShopFoundationEnver(this, OndemandContractsSandbox.myInst.accounts.workspace1, 'us-west-1',
            new SRC_Rev_REF('b', 'master'));
        this.envers = [this.theOne]
    }

}