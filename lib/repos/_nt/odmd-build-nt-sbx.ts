import {
    IPAM_AB,
    OdmdBuildNetworking,
    SRC_Rev_REF
} from "@ondemandenv.dev/contracts-lib-base";
import * as path from "path";

class IPAM_WEST1_LE extends IPAM_AB {
    readonly enverContextMD = path.resolve(__dirname, 'docs', 'placeholder.md')

    constructor(owner: OdmdBuildNetworking, rev: SRC_Rev_REF) {
        super(owner, 'us-west-1', rev);
    }

    cidrs = ['10.0.0.0/12', '10.16.0.0/12']

    readonly hostedZoneName: string = 'odmd-lew1.internal'

}


class IPAM_WEST2_LE extends IPAM_AB {
    readonly enverContextMD = path.resolve(__dirname, 'docs', 'placeholder.md')

    constructor(owner: OdmdBuildNtSbx, rev: SRC_Rev_REF) {
        super(owner, 'us-west-2', rev);
    }

    cidrs = ['10.32.0.0/12', '10.48.0.0/12']

    readonly hostedZoneName: string = 'odmd-lew2.internal'
}


export class OdmdBuildNtSbx extends OdmdBuildNetworking {
    readonly serviceContextMD = path.resolve(__dirname, 'docs', 'placeholder.md')
    readonly serviceOverviewMD = path.resolve(__dirname, 'docs', 'placeholder.md')

    ipam_west2_le: IPAM_WEST2_LE;

    protected initializeEnvers() {
        this._envers = [];
        this.ipam_west1_le = new IPAM_WEST1_LE(this, new SRC_Rev_REF("b", "ipam_west1_le"));
        this._envers.push(this.ipam_west1_le);
        this.ipam_west2_le = new IPAM_WEST2_LE(this, new SRC_Rev_REF("b", "ipam_west2_le"));
        this._envers.push(this.ipam_west2_le);
    }
}

