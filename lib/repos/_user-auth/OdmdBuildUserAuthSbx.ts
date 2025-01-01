import {
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {
    OdmdBuildUserAuth,
    OdmdEnverUserAuth
} from "@ondemandenv/contracts-lib-base/lib/repos/__user-auth/odmd-build-user-auth";

export class OdmdEnverUserAuthSbx extends OdmdEnverUserAuth {


    constructor(owner: OdmdBuildUserAuthSbx, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);

    }


}


export class OdmdBuildUserAuthSbx extends OdmdBuildUserAuth {
    get envers(): OdmdEnverUserAuthSbx[] {
        return this._envers;
    }

    ownerEmail?: string | undefined;
    // readonly extraIamStatements: PolicyStatement[];


    protected initializeEnvers(): void {
        this._envers = [
            new OdmdEnverUserAuthSbx(this, this.contracts.accounts.workspace0, 'us-east-1',
                new SRC_Rev_REF('b', 'main')),
        ] as OdmdEnverUserAuthSbx[]
    }

    get contracts() {
        return this.node.scope as OndemandContractsSandbox;
    }
}