import {
    ContractsCrossRefConsumer,
    ContractsEnverCdk, ContractsEnverCtnImg,
    ContractsRdsCluster,
    ContractsVpc, SRC_Rev_REF,
    WithRds
} from "@ondemandenv/contracts-lib-base";
import {OdmdBuildSampleSpringCdk} from "./odmd-build-sample-spring-cdk";
import {OndemandContractsSandbox} from "../../../OndemandContractsSandbox";


/**
 * so that the cdk code to use EksManifest which takes KubeCtlThruVpc as param
 */
export class OdmdEnverSampleSpringCdkKubeEks extends ContractsEnverCdk implements WithRds {


    vpcConfig: ContractsVpc
    rdsConfig: ContractsRdsCluster

    readonly appImg: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkKubeEks, ContractsEnverCtnImg>
    readonly migrateImg: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkKubeEks, ContractsEnverCtnImg>

    constructor(owner: OdmdBuildSampleSpringCdk) {
        super(owner, owner.contracts.accounts.workspace0, "us-west-1", new SRC_Rev_REF("b", "p0dmdSbxUsw1"))

        const vpcRds = owner.contracts.defaultVpcRds!.getOrCreateOne(this, {
            ipamEnver: owner.contracts.networking!.ipam_west1_le,
            vpcName: 'springcdkecs'
        })
        this.vpcConfig = vpcRds.vpcConfig
        this.rdsConfig = vpcRds.getOrCreateRdsCluster('sample')

        this.migrateImg = new ContractsCrossRefConsumer(this, 'migImage', owner.contracts.springRdsImg.enverImg.migImgRefProducer);
        this.appImg = new ContractsCrossRefConsumer(this, 'appContainer', owner.contracts.springRdsImg.enverImg.appImgRefProducer);

    }

}
