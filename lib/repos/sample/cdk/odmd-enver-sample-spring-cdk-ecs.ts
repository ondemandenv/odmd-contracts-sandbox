import {
    AnyContractsEnVer,
    BorrowVpcRds, ContractsCrossRefConsumer,
    ContractsEnverCdk,
    ContractsEnverCdkDefaultVpc, ContractsRdsCluster,
    ContractsVpc, PgSchemaUsersProps, PgUsr, SRC_Rev_REF,
    WithRds
} from "@ondemandenv/contracts-lib-base";
import {OdmdBuildSampleSpringCdk} from "./odmd-build-sample-spring-cdk";
import {OndemandContractsSandbox} from "../../../OndemandContractsSandbox";


export class OdmdEnverSampleSpringCdkEcs extends ContractsEnverCdk implements BorrowVpcRds, WithRds {


    readonly vpcRdsProvidingEnver: ContractsEnverCdkDefaultVpc;

    readonly vpcConfig: ContractsVpc
    readonly rdsConfig: ContractsRdsCluster

    public readonly pgSchemaUsersProps: PgSchemaUsersProps
    public readonly readOnlyPub: PgUsr


    readonly imgSrcEnver

    readonly rdsPort: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyContractsEnVer>
    readonly rdsHost: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyContractsEnVer>
    readonly rdsSocketAddress: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyContractsEnVer>
    readonly rdsUsrReadOnly: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyContractsEnVer>

    readonly migImgName: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyContractsEnVer>
    readonly appImgName: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyContractsEnVer>

    constructor(owner: OdmdBuildSampleSpringCdk) {
        super(owner, OndemandContractsSandbox.myInst.accounts.workspace1, "us-west-1", new SRC_Rev_REF("b", "odmdSbxUsw1"));


        this.readOnlyPub = {
            roleType: 'readonly',
            userName: 'cdkecs_readonly1'
        };

        this.vpcRdsProvidingEnver = OndemandContractsSandbox.myInst.defaultVpcRds!.getOrCreateOne(this, {
            ipamEnver: OndemandContractsSandbox.myInst.networking!.ipam_west1_le,
            vpcName: 'springcdkecs'
        })

        this.vpcConfig = this.vpcRdsProvidingEnver.vpcConfig
        this.rdsConfig = this.vpcRdsProvidingEnver.getOrCreateRdsCluster('sample')


        this.pgSchemaUsersProps = new PgSchemaUsersProps(this, 'cdkecs', [this.readOnlyPub]);
        this.vpcRdsProvidingEnver.addSchemaUsers(this.rdsConfig, this.pgSchemaUsersProps)

        this.rdsPort = new ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'rdsPort', this.rdsConfig.clusterPort)
        this.rdsHost = new ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'rdsHost', this.rdsConfig.clusterHostname)
        this.rdsSocketAddress = new ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'rdsSocketAddress', this.rdsConfig.clusterSocketAddress)
        this.rdsUsrReadOnly = new ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'rdsUsrReadOnly', this.rdsConfig.usernameToSecretId.get(this.readOnlyPub.userName)!)

        this.preCdkCmds.push('npm run build')
        this.imgSrcEnver = OndemandContractsSandbox.myInst.springRdsImg.enverImg;

        this.migImgName = new ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'migImgName', this.imgSrcEnver.migImgRefProducer)
        this.appImgName = new ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'appImgName', this.imgSrcEnver.appImgRefProducer)

        const imgToRepoProducers = this.imgSrcEnver.builtImgNameToRepoProducer;

        for (const imgName in imgToRepoProducers) {
            new ContractsCrossRefConsumer(this, imgName, imgToRepoProducers[imgName])
        }
    }

}
