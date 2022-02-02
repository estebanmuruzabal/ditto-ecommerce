import React from 'react';
import {useDrawerDispatch} from '../../context/DrawerContext';
import {
    IconWrapper,
    ActionStyle,
} from '../Types/Types.style';
import {AllIcons} from "../../assets/icons/all-icons";
import gql from 'graphql-tag';
import {useMutation} from "@apollo/react-hooks";


type Props = {
    itemData: any;
    itemsOffset: number;
};

const Icon = ({icon, width = '18px', height = '18px'}) => {
    let Component = AllIcons.hasOwnProperty(icon) ? AllIcons[icon] : 'span';
    return <Component width={width} height={height}/>;
}

const ActionWrapper: React.FC<Props> =
    ({
         itemData,
        itemsOffset,
         ...props
     }) => {
        const dispatch = useDrawerDispatch();
        const openDrawer = React.useCallback(
            () => {
                dispatch({
                    type: 'OPEN_DRAWER',
                    drawerComponent: 'ORDER_STATUS_UPDATE_FORM',
                    data: itemData,
                })
            },
            [dispatch, itemData]
        );
        


        return (
            <div>
                <ActionStyle>
                    <IconWrapper onClick={openDrawer} style={{marginRight: '10px', cursor: 'pointer'}}>
                        <Icon icon="ArrowNext"/>
                    </IconWrapper>
                </ActionStyle>
                {/*<ActionStyle>
                    <IconWrapper onClick={} style={{color: '#c50707', cursor: 'pointer'}}>
                        <Icon width="15px" height="15px" icon="CloseIcon"/>
                    </IconWrapper>
                </ActionStyle>*/}
            </div>
        );
    };

export default ActionWrapper;
