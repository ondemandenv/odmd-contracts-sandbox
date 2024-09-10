import {OdmdConfigOdmdContractsNpm} from "@ondemandenv/contracts-lib-base";
import {AccountsSbx, GithubReposSbx} from "../../OndemandContractsSandbox";

export class ContractsNpmSbx extends OdmdConfigOdmdContractsNpm<AccountsSbx, GithubReposSbx> {

    public get packageName(): string {
        return '@ondemandenv/odmd-contracts-sandbox'
    }

}