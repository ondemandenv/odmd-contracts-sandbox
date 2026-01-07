import {
    SRC_Rev_REF,
    OdmdBuildUserAuth,
    OdmdEnverUserAuth,
    IOdmdEnver
} from "@ondemandenv.dev/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import * as path from "path";

export class OdmdEnverUserAuthSbx extends OdmdEnverUserAuth {
    readonly enverContextMD = path.resolve(__dirname, 'docs', 'SERVICE_OVERVIEW.md')
    constructor(owner: OdmdBuildUserAuthSbx, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);

        // this.productsReplicaToRegions.add('us-west-1');
        // this.productsReplicaToRegions.add('us-west-2');

    }

    readonly owner: OdmdBuildUserAuthSbx;




    getRevStackNames(): Array<string> {
        const name = super.getRevStackNames()[0];
        return [name, name + '-web-hosting', name + '-web-ui'];
    }
}


export class OdmdBuildUserAuthSbx extends OdmdBuildUserAuth {
    readonly serviceContextMD = path.resolve(__dirname, 'docs', 'SERVICE_OVERVIEW.md')
    readonly serviceOverviewMD = path.resolve(__dirname, 'docs', 'SERVICE_OVERVIEW.md')

    ownerEmail?: string | undefined;

    // readonly extraIamStatements: PolicyStatement[];


    protected initializeEnvers(): void {
        this._envers = [
            new OdmdEnverUserAuthSbx(this, this.contracts.accounts.workspace0, 'us-east-1',
                new SRC_Rev_REF('b', 'odmd-sbx')),
        ] as OdmdEnverUserAuthSbx[]
    }

    get contracts() {
        return this.node.scope as OndemandContractsSandbox;
    }


}