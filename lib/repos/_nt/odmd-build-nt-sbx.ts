import {
    IPAM_AB,
    OdmdBuild, OdmdBuildNetworking, OdmdEnverCdk,
    SRC_Rev_REF, WithVpc
} from "@ondemandenv.dev/contracts-lib-base";
import * as path from "path";
import {EksClusterEnverSbx} from "../_eks/odmd-build-eks-sbx";


class IPAM_WEST2_LE extends IPAM_AB {
    readonly enverContextMD = path.resolve(__dirname, 'docs', 'placeholder.md')

    constructor(owner: OdmdBuildNtSbx, rev: SRC_Rev_REF) {
        super(owner, 'us-west-1', rev);
    }

    cidrs = ['10.0.0.0/12', '10.16.0.0/12']
    // preCdkCmds = [
    //     `TOKEN=$(aws secretsmanager get-secret-value --secret-id networking-bk-gh-pat --query 'SecretString' --output text)`,
    //     `echo "@gyanglz:registry=https://npm.pkg.github.com/" >> .npmrc`,
    //     `echo "//npm.pkg.github.com/:_authToken=$TOKEN" >> .npmrc`,
    // ]

    readonly hostedZoneName: string = 'odmd-le.internal'

}


export class OdmdBuildNtSbx extends OdmdBuildNetworking {
    readonly serviceContextMD = path.resolve(__dirname, 'docs', 'placeholder.md')
    readonly serviceOverviewMD = path.resolve(__dirname, 'docs', 'placeholder.md')

    ipam_west2_le: IPAM_WEST2_LE;

    protected initializeEnvers() {
        this._envers = [];
        this.ipam_west2_le = new IPAM_WEST2_LE(this, new SRC_Rev_REF("b", "ipam_west2_le"));
        this._envers.push(this.ipam_west2_le);
    }
}

