"use client"
import React from 'react'
import {EntityHeader} from "@/components/Entity-Components";
import {useRouter} from "next/navigation";


const CredentialHeader = ({disabled}: any) => {

    const router =useRouter()
    return (
        <>

            <EntityHeader title='Учетные данные' description='Создавай и управляй своими учетными данными'
                          onNew={() => router.push("/credentials/new")}
                          newButtonLabel='Новый credential'
                          disabled={disabled}
                          isCreating={false}

            />
        </>
    )
}
export default CredentialHeader
