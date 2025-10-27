import {
    OdmdBuildContractsLib,
    OdmdEnverContractsLib,
    SRC_Rev_REF
} from "@ondemandenv.dev/contracts-lib-base";

import {AccountsSbx, GithubReposSbx, OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import * as path from "path";

class OdmdEnverContractsLibSeed extends OdmdEnverContractsLib {
    readonly enverContextMD = path.resolve(__dirname, 'docs', 'placeholder.md')
}
export class OdmdBuildContractsSbx extends OdmdBuildContractsLib<AccountsSbx, GithubReposSbx> {
    readonly serviceContextMD = path.resolve(__dirname, 'docs', 'placeholder.md')
    readonly serviceOverviewMD = path.resolve(__dirname, 'docs', 'placeholder.md')
    protected _envers: OdmdEnverContractsLib[];
    get envers(): OdmdEnverContractsLib[] {
        return this._envers;
    }

    get theOne(): OdmdEnverContractsLib {
        return this._envers[0];
    }

    ownerEmail?: string | undefined;

    public get packageName(): string {
        return '@ondemandenv/odmd-contracts-sandbox';
    }

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'odmd-contracts-npm');
    }

    protected initializeEnvers(): void {
        this._envers = [
            new OdmdEnverContractsLibSeed(
                this,
                this.contracts.accounts.workspace0,
                'us-west-1',
                new SRC_Rev_REF("b", "main")
            ),
            new OdmdEnverContractsLibSeed(
                this,
                this.contracts.accounts.workspace0,
                'us-west-2',
                new SRC_Rev_REF("b", "__placeholder_us-west-2")
            ),
            new OdmdEnverContractsLibSeed(
                this,
                this.contracts.accounts.workspace0,
                'us-east-1',
                new SRC_Rev_REF("b", "__placeholder_us-east-1")
            )
        ];
    }

    get contracts(): OndemandContractsSandbox {
        return super.contracts as OndemandContractsSandbox;
    }
}