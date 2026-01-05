"use client"
import React from 'react'
import {EntityHeader} from "@/components/Entity-Components";
import {useRouter} from "next/navigation";


const ExecutionHeader = ({disabled}: any) => {

    const router =useRouter()
    return (
        <>

            <EntityHeader title='Запуски' description='Смотреть вашу историю запуском'


                          disabled={disabled}
                          isCreating={false}

            />
        </>
    )
}
export default ExecutionHeader
