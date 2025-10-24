import {
    IPAM_AB,
    OdmdBuild,OdmdCrossRefConsumer, OdmdCrossRefProducer,
    OdmdEnverCdk, OdmdEnverEksCluster, OdmdIpAddresses,
    OdmdVpc,
    SRC_Rev_REF, WithVpc
} from "@ondemandenv.dev/contracts-lib-base";
import * as path from "path";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";

export class EksClusterEnverSbx extends OdmdEnverEksCluster implements WithVpc {
    readonly enverContextMD = path.resolve(__dirname, 'docs', 'placeholder.md')
    ephemeral: boolean = false
    readonly vpcConfig: OdmdVpc
    readonly clusterName: string

    readonly privateDomainName = new OdmdCrossRefProducer<OdmdEnverEksCluster>(this, 'privateDomainName')
    readonly centralVpcCidr: OdmdCrossRefConsumer<this, IPAM_AB>;

    constructor(owner: OdmdBuildEksSbx, id: string) {
        super(owner, owner.contracts.accounts.workspace0, 'us-west-1', new SRC_Rev_REF("b", 'main'));
        const ipamWest2Le = owner.contracts.networking!.ipam_west2_le;
        const adr = new OdmdIpAddresses(this, ipamWest2Le.ipamPoolName)

        this.vpcConfig = new OdmdVpc(adr, 'the-vpc');
        this.clusterName = id

        this.centralVpcCidr = new OdmdCrossRefConsumer(this, 'centralVpcCidr', ipamWest2Le.centralVpcCidr)
    }
}


export class OdmdBuildEksSbx extends OdmdBuild<OdmdEnverCdk> {
    readonly serviceContextMD = path.resolve(__dirname, 'docs', 'placeholder.md')
    readonly serviceOverviewMD = path.resolve(__dirname, 'docs', 'placeholder.md')

    protected initializeEnvers(): void {
        this._envers = [new EksClusterEnverSbx(this, 'odmd-sbx-eks-cluster-usw10')]
    }

    protected _envers: Array<EksClusterEnverSbx>
    get envers(): EksClusterEnverSbx[] {
        return this._envers
    }

    ownerEmail?: string | undefined;

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'eks-cluster-sbx', scope.githubRepos.__eks!);

    }

    public get contracts() {
        return this.node.scope as OndemandContractsSandbox
    }

}

