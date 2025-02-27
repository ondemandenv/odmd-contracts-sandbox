import {
    IPAM_AB,
    OdmdBuild,
    OdmdBuildContractsLib, OdmdCrossRefConsumer, OdmdCrossRefProducer,
    OdmdEnverCdk, OdmdEnverEksCluster, OdmdIpAddresses,
    OdmdVpc,
    OndemandContracts, SRC_Rev_REF, WithVpc
} from "@ondemandenv/contracts-lib-base";
import {
    AccountsCentralView,
    GithubReposCentralView
} from "@ondemandenv/contracts-lib-base/lib/OdmdContractsCentralView";

export class EksClusterEnverSbx extends OdmdEnverEksCluster implements WithVpc {
    ephemeral: boolean = false
    readonly vpcConfig: OdmdVpc
    readonly clusterName: string

    readonly privateDomainName = new OdmdCrossRefProducer<OdmdEnverEksCluster>(this, 'privateDomainName')
    readonly centralVpcCidr: OdmdCrossRefConsumer<this, IPAM_AB>;

    constructor(owner: OdmdBuildEksSbx, id: string) {
        super(owner, owner.contracts.accounts.workspace0, 'us-west-1', new SRC_Rev_REF("b", 'main'));
        const ipamWest1Le = owner.contracts .networking!.ipam_west1_le;
        const adr = new OdmdIpAddresses(this, ipamWest1Le.ipamPoolName)

        this.vpcConfig = new OdmdVpc(adr, 'the-vpc');
        this.clusterName = id

        this.centralVpcCidr = new OdmdCrossRefConsumer(this, 'centralVpcCidr', ipamWest1Le.centralVpcCidr)
    }
}


export class OdmdBuildEksSbx extends OdmdBuild<OdmdEnverCdk> {
    protected initializeEnvers(): void {
        this._envers = [new EksClusterEnverSbx(this, 'odmd-sbx-eks-cluster-usw10')]
    }

    private _envers: Array<EksClusterEnverSbx>
    get envers(): EksClusterEnverSbx[] {
        return this._envers
    }

    ownerEmail?: string | undefined;

    constructor(scope: OndemandContracts<
        AccountsCentralView,
        GithubReposCentralView,
        OdmdBuildContractsLib<AccountsCentralView, GithubReposCentralView>
    >) {
        super(scope, 'eks-cluster-sbx', scope.githubRepos.__eks!);

    }


}

