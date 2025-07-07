import React, { useState, useEffect, useRef } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Box, Modal, Typography, colors, TableFooter, Autocomplete, Hidden, Grid } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createLot, getAllLot, saveLot, getLotDatewise, getProductName } from "../../Api/processTableApi";
import { styled } from "@mui/material/styles";
import { processStepId } from "../../ProcessStepId/processStepId";
import "jspdf-autotable";
import './process.css'



const processes = ["Melting", "Wire", "Machine", "Soldrine", "Joint", "Cutting", "Finishing"];
const StyledTableCell = styled(TableCell)({ border: "1px solid #ccc", textAlign: "center", padding: "5px", });
const StyledTableContainer = styled(TableContainer)({ margin: "10px auto", maxWidth: "100%", border: "1px solid #ccc" });
const StyledInput = styled(TextField)({ "& .MuiOutlinedInput-notchedOutline": { border: "none" }, "& .MuiInputBase-input": { textAlign: "center", padding: "2px" }, width: "30px" });

const ProcessTable = () => {
  const [data, setData] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [initialWeight, setInitialWeight] = useState("");
  const [touchValue, setTouchValue] = useState("");
  const [isLotCreated, setIsLotCreated] = useState(false);
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [calculation, setCalculation] = useState([
    { rawGold: 0 },
    { touchValue: 0 },
    {
      process: [
        { processName: "Melting", Weight: [{ bw: 0 }, { aw: 0 }, { sw: 0 }, { lw: 0 }] },
        { processName: "Wire", Weight: [{ bw: 0 }, { aw: 0 }, { sw: 0 }, { lw: 0 }] },
        { processName: "Machine", Weight: [{ bw: 0 }, { aw: 0 }, { lw: 0 }] },
        { processName: "Soldrine", Weight: [{ bw: 0 }, { aw: 0 }, { sw: 0 }, { lw: 0 }] },
        { processName: "Joint", Weight: [{ bw: 0 }, { aw: 0 }, { sw: 0 }, { lw: 0 }] },
        { processName: "Cutting", Weight: [{ bw: 0 }, { aw: 0 }, { lw: 0 }, { pw: 0 }] },
        { processName: "Finishing", Weight: [{ bw: 0 }, { aw: 0 }, { sw: 0 }, { lw: 0 }] },
      ],
    },
    {
      lotTotal: 0
    }
  ]);
  const [productName, setProductName] = useState([])
  const touchRef = useRef()
  const saveRef = useRef()
  const meltingRef = useRef({})
  const wiringRef = useRef({})
  const mechineRef = useRef({})
  const cuttingBoxRef=useRef({})
  const melting = (rowId, field) => (el) => {

    if (!meltingRef.current[rowId]) meltingRef.current[rowId] = {};
    meltingRef.current[rowId][field] = el;
  };
  const wiring = (rowId, field) => (el) => {

    if (!wiringRef.current[rowId]) wiringRef.current[rowId] = {};
    wiringRef.current[rowId][field] = el;
  };
  const mechine = (rowId, field, index) => (el) => {
    if (!mechineRef.current[rowId]) mechineRef.current[rowId] = {};
    if (!mechineRef.current[rowId][field]) mechineRef.current[rowId][field] = [];
    mechineRef.current[rowId][field][index] = el;
  };
  const cuttingBox=(rowId, field) => (el) => {

    if (!cuttingBoxRef.current[rowId]) cuttingBoxRef.current[rowId] = {};
    cuttingBoxRef.current[rowId][field] = el;
  };
  const handleKeyCutting=(e,lotid,field)=>{

  if(field=== "cuttingBoxScarp" || field==="cuttingBoxTouch"){
       console.log('lotidcuttingBox',lotid)
        const cuttingBoxFields = ["cuttingBoxScarp", "cuttingBoxTouch"];
        const currentIndex=cuttingBoxFields.indexOf(field)

        let nextField;
         if (e.key === "Enter" || e.key === "ArrowRight") {
        nextField = cuttingBoxFields[currentIndex + 1];
      } else if (e.key === "ArrowLeft") {
        nextField = cuttingBoxFields[currentIndex - 1];
      }

      if (nextField && cuttingBoxRef.current[lotid]?.[nextField]) {
        cuttingBoxRef.current[lotid][nextField].focus();
      }
    }
  }
  const handleKeyDown = (e, rowId, field, index) => {
    const fields = [
      "mechineAfter", "soldringAfter", "soldringScarp",
      "jointAfter", "jointScarp", "cuttingAfter", "finishingAfter", "finishingScarp"
    ];

    if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Enter") { // mechine to finishing process
      const currentIndex = fields.indexOf(field);

      const nextIndex =
        e.key === "ArrowRight" || e.key === "Enter"
          ? currentIndex + 1
          : currentIndex - 1;

      const targetField = fields[nextIndex];

      if (targetField && mechineRef.current[rowId]?.[targetField]?.[index]) {
        mechineRef.current[rowId][targetField][index].focus();
      }
    }
     // handle melting
    // if (e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight") {

    if (field === "meltingAfter" || field === "meltingScarp") {
      const meltFields = ["meltingAfter", "meltingScarp"];
      const currentIndex = meltFields.indexOf(field);
      
      let nextField;
      if (e.key === "Enter" || e.key === "ArrowRight") {
        nextField = meltFields[currentIndex + 1];
      } else if (e.key === "ArrowLeft") {
        nextField = meltFields[currentIndex - 1];
      }

      if (nextField && meltingRef.current[rowId]?.[nextField]) {
        meltingRef.current[rowId][nextField].focus();
      }
    }

    // handle wiring
    if (field === "wiringAfter" || field === "wiringScarp") {
      const wiringFields = ["wiringAfter", "wiringScarp"];
      const currentIndex = wiringFields.indexOf(field);
     
      let nextField;
      if (e.key === "Enter" || e.key === "ArrowRight") {
        nextField = wiringFields[currentIndex + 1];
      } else if (e.key === "ArrowLeft") {
        nextField = wiringFields[currentIndex - 1];
      }

      if (nextField && wiringRef.current[rowId]?.[nextField]) {
        wiringRef.current[rowId][nextField].focus();
      }
     }

     
  };


  const docalculation = (arrayItems) => {
    // Calculation
    const tempData = [...arrayItems];
    let lotTotal = tempData.reduce((acc, item) => {
      if (item.data && item.data[0]?.ProcessSteps[0]?.AttributeValues[0]?.value) {
        return acc + item.data[0].ProcessSteps[0].AttributeValues[0].value;
      }
      return acc; // skip this item, don't add anything
    }, 0);
    const tempCalculation = [...calculation];//over lot all raw gold total
    tempCalculation[0].rawGold = lotTotal;

    let finishTotal = 0;
    tempData.forEach((lotData) => {
      if (
        lotData.data &&
        lotData.data[7]?.ProcessSteps?.[1]?.AttributeValues &&
        lotData.data[7].ProcessSteps[1].AttributeValues.length !== 0
      ) {
        lotData.data[7].ProcessSteps[1].AttributeValues.forEach((arrItem) => {
          if (arrItem?.value) {
            finishTotal += arrItem.value;
          }
        });
      }
    });

    tempCalculation[2].process[6].Weight[1].aw = Number(finishTotal)
    console.log('finishTotal', finishTotal)

    let finsihAfterValue = 0;
    let lotFinishValue = 0;
    tempData.forEach((lotData, lotIndex) => {// this calculation for lotDifferent Total
      if (lotData.data) {
        if (lotData.data[7].ProcessSteps[1].AttributeValues.length === 0) {
          finsihAfterValue = 0;
        } else {
          lotData.data[7].ProcessSteps[1].AttributeValues.forEach((arrItem, arrIndex) => {
            finsihAfterValue += arrItem.value
          })
          lotFinishValue += lotData.data[0].ProcessSteps[0].AttributeValues[0].value - finsihAfterValue
          finsihAfterValue = 0;
        }
      }

    })
    tempCalculation[3].lotTotal = lotFinishValue
    //calculation for total scarp value and loss total
    for (let i = 1; i <= 7; i++) {
      let scarpTotal = 0, lossTotal = 0;
      let innerScarp = 0, innerLoss = 0;
      for (let j = 0; j < tempData.length; j++) {
        const dataItem = tempData[j]?.data?.[i];
        const processSteps = dataItem?.ProcessSteps;
        const attrValues = processSteps?.[2]?.AttributeValues;

        if (attrValues && attrValues.length !== 0) {
          attrValues.forEach((attrItem, attrIndex) => {
          
            if (i!== 3 && i!==6) {
                 const scrapValue = processSteps?.[2]?.AttributeValues?.[attrIndex]?.value || 0;
                 const lossValue = processSteps?.[3]?.AttributeValues?.[attrIndex]?.value || 0;
                 innerScarp += Number(scrapValue);
                 innerLoss += Number(lossValue);
              }
          });
        }
      }

      scarpTotal += innerScarp;
      lossTotal += innerLoss;
      

      if (i !== 3 && i !==6) {
        tempCalculation[2].process[i - 1].Weight[2].sw = scarpTotal
        tempCalculation[2].process[i - 1].Weight[3].lw = lossTotal
      }
      console.log('tempCalculation for scw,losw', tempCalculation)
    }
    return tempCalculation
  }

  const handleInitialChange = (lotid, index, value) => {
    console.log(value)
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);
    console.log('touch', lotData[0].data[0].ProcessSteps[0].AttributeValues[0].value)
    lotData[0].data[0].ProcessSteps[0].AttributeValues[0].value = parseFloat(value);
    lotData[0].data[1].ProcessSteps[0].AttributeValues[0].value = parseFloat(value);
    tempData.splice(index, 1, lotData[0]);
    setItems(tempData)
    console.log('itemsData', items)
  }

  const handleTouchChange = (lotid, index, value) => {
    console.log(value)
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);
    console.log('lotData from function', lotData)
    console.log('touch', lotData[0].data[0].ProcessSteps[0].AttributeValues[0].touchValue);
    lotData[0].data[0].ProcessSteps[0].AttributeValues[0].touchValue = parseFloat(value);
    //when user change touch value that time also we need to change pure weight
    if (lotData[0].data[6].ProcessSteps[2].AttributeValues.length != 0) {
      lotData[0].data[6].ProcessSteps[2].AttributeValues.forEach((item, index) => {
        lotData[0].data[6].ProcessSteps[3].AttributeValues[index].value = lotData[0].data[0].ProcessSteps[0].AttributeValues[0].touchValue * lotData[0].data[6].ProcessSteps[2].AttributeValues[index].value / 100
      })
    }
    tempData.splice(index, 1, lotData[0]);
    setItems(tempData)
    console.log('itemsData', items)

  };
  const findProcessStep = (process_id, attribute_id) => {
    for (let i = 0; i < processStepId.length; i++) {
      for (let j = 0; j < processStepId[i].length; j++) {
        if (processStepId[i][j].process_id === process_id && processStepId[i][j].attribute_id === attribute_id) {
          return processStepId[i][j].process_step_id;
        }
      }
    }
    return null; // Return null if no match is found
  };


  const handleSingleItem = (index, lotid, process_id, attribute_id, value, lotIndex) => {
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);
    console.log('handelSingleItem', index + 1, lotid, process_id, attribute_id, value);

    if (process_id === 2) { //Melting Processs
      if (attribute_id === 3) {
        const obj = {
          lot_id: lotid,
          process_step_id: findProcessStep(process_id, attribute_id),
          // item_name: lotData.data[index].ProcessSteps[0].AttributeValues[0].item_name,
          attribute_id: attribute_id,
          items_id: lotData[0].data[0].ProcessSteps[0].AttributeValues[0].items_id,
          value: parseFloat(value)
        }
        if (lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.length === 0) {
          lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.push(obj);
          const nextProcessObj = {
            lot_id: lotid,
            process_step_id: 6,
            items_id: lotData[0].data[0].ProcessSteps[0].AttributeValues[0].items_id,
            // item_name:lotData.data[index].ProcessSteps[0].AttributeValues[0].item_name,
            attribute_id: 2,
            value: parseFloat(value)
          }
          lotData[0].data[2].ProcessSteps[0].AttributeValues.push(nextProcessObj);
          const lossObj = {
            lot_id: lotid,
            process_step_id: 5,
            items_id: lotData[0].data[0].ProcessSteps[0].AttributeValues[0].items_id,
            attribute_id: 5,
            value: lotData[0].data[index + 1].ProcessSteps[0].AttributeValues.length === 1 && lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.length === 1 ? (lotData[0].data[index + 1].ProcessSteps[0].AttributeValues[0].value - lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value) : 0
          }
          lotData[0].data[index + 1].ProcessSteps[3].AttributeValues.push(lossObj);

          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData)
        } else { //Melting Process After Weight Update
          lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value = parseFloat(value);
          lotData[0].data[2].ProcessSteps[0].AttributeValues[0].value = parseFloat(value);

          if (lotData[0].data[index + 1].ProcessSteps[0].AttributeValues.length === 1 && lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.length === 1) {
            lotData[0].data[index + 1].ProcessSteps[3].AttributeValues[0].value = (lotData[0].data[index + 1].ProcessSteps[0].AttributeValues[0].value - lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value)
          }
          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData)
        }
      }
      else if (attribute_id === 4) {// Melting Process Scrap Value Insert
        const obj = {
          lot_id: lotid,
          process_step_id: findProcessStep(process_id, attribute_id),
          // item_name: lotData.data[index].ProcessSteps[0].AttributeValues[0].item_name,
          attribute_id: attribute_id,
          items_id: lotData[0].data[0].ProcessSteps[0].AttributeValues[0].items_id,
          value: parseFloat(value)
        }
        if (lotData[0].data[index + 1].ProcessSteps[2].AttributeValues.length === 0) {
          lotData[0].data[index + 1].ProcessSteps[2].AttributeValues.push(obj);
          lotData[0].data[index + 1].ProcessSteps[3].AttributeValues[0].value=lotData[0].data[index + 1].ProcessSteps[0].AttributeValues.length === 1 && lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.length === 1 ? (lotData[0].data[index + 1].ProcessSteps[0].AttributeValues[0].value - lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value) - parseFloat(value) : 0
          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData)
        } else {// Melting Process ScrapValue Update
          lotData[0].data[index + 1].ProcessSteps[2].AttributeValues[0].value = parseFloat(value);
          if (lotData[0].data[index + 1].ProcessSteps[0].AttributeValues.length === 1 && lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.length === 1) {
            lotData[0].data[index + 1].ProcessSteps[3].AttributeValues[0].value = (lotData[0].data[index + 1].ProcessSteps[0].AttributeValues[0].value - lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value) - parseFloat(value)
          }

          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData)
        }
      }
    }//Melting ProcessEnd

  }

  const handleAddItemColumns = (lotid, index) => {

    console.log('lotid', lotid);
    const tempData = [...items];

    const lotData = tempData.filter((item, index) => item.lotid === lotid);

    let processstepid = 6;
    for (let i = 2; i <= 7; i++) {
      for (let j = 1; j <= 4; j++) {
        if (processstepid === 13 && j === 4) {
          continue;
        }
        if (processstepid === 6 && j === 1) {
          ++processstepid;
          continue;
        }
        if (processstepid === 24) {
          ++processstepid;//its used For CuttingProcessPureWeight
          continue;
        }
        const obj = {
          lot_id: lotid,
          process_step_id: processstepid,
          item_name: " ",
          items_id: null,
          attribute_id: (processstepid === 12 || processstepid === 23 ? 5 : j + 1),// in this time assign attribute id for mechine and cutting loss value
          value: null,
          touchValue: null,
          index: null,
          master_jewel_id: null
        }
        lotData[0].data[i].ProcessSteps[j - 1].AttributeValues.push(obj)
        ++processstepid;
      }

    }
    processstepid = 6

    const obj = {
      lot_id: lotid,
      process_step_id: 24,
      item_name: " ",
      items_id: null,
      attribute_id: 6,
      touchValue: null,
      value: null,
      index: null,
      master_jewel_id: null
    }
    lotData[0].data[6].ProcessSteps[3].AttributeValues.push(obj)

    tempData.splice(index, 1, lotData[0]);
    console.log('Add Items', tempData);
    setItems(tempData);
    console.log('items', items);
  };
  const handleChildItemName = (lotid, childIndex, itemName, lotIndex, master_jewel_id, touchValue) => {

    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);

    for (let i = 2; i <= 7; i++) {//this create childItem name Each Process and store jewelItem also
      for (let j = 0; j <= 3; j++) {
        if ((i === 3 && j === 3) || (i === 6 && j === 3)) {// its don't add value for scarp to Mechine and Cutting process
          continue
        }
        if (i === 2 && j === 0) {
          continue
        }
        lotData[0].data[i].ProcessSteps[j].AttributeValues[childIndex].item_name = String(itemName);
        lotData[0].data[i].ProcessSteps[j].AttributeValues[childIndex].master_jewel_id = master_jewel_id;
        lotData[0].data[i].ProcessSteps[j].AttributeValues[childIndex].touchValue = touchValue;
      }
    }
    //Store Item name and Item id to PureWeight
    lotData[0].data[6].ProcessSteps[3].AttributeValues[childIndex].item_name = String(itemName);
    lotData[0].data[6].ProcessSteps[3].AttributeValues[childIndex].master_jewel_id = master_jewel_id;
    lotData[0].data[6].ProcessSteps[3].AttributeValues[childIndex].touchValue = touchValue;
    for (let i = 2; i <= 7; i++) {//this create Index  Each Process
      if (i === 6) {
        lotData[0].data[i].ProcessSteps[3].AttributeValues[childIndex].index = childIndex
      }
      for (let j = 0; j <= 3; j++) {
        if ((i === 3 && j === 3) || (i === 6 && j === 3)) {
          continue
        }
        if (i === 2 && j === 0) {
          continue
        }
        lotData[0].data[i].ProcessSteps[j].AttributeValues[childIndex].index = childIndex
      }
    }

    tempData.splice(lotIndex, 1, lotData[0]);
    setItems(tempData);
    console.log('items', items);
  }

  const handleChildItemWeight = (lotid, childIndex, itemWeight, lotIndex, attribute_id) => {
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);
    if (attribute_id === 3) {
      //After  
      lotData[0].data[2].ProcessSteps[1].AttributeValues[childIndex].value = parseFloat(itemWeight);
      lotData[0].data[2].ProcessSteps[1].AttributeValues[childIndex].index = childIndex

      let afterTotal = 0
      for (const loss of lotData[0].data[2].ProcessSteps[1].AttributeValues) {
        afterTotal += loss.value
      }
      //Loss

      lotData[0].data[2].ProcessSteps[3].AttributeValues[0].value =lotData[0].data[2].ProcessSteps[0].AttributeValues.length===1? lotData[0].data[2].ProcessSteps[0].AttributeValues[0].value - afterTotal:0-afterTotal
      lotData[0].data[2].ProcessSteps[3].AttributeValues[0].index = childIndex
      // next process before 
      lotData[0].data[3].ProcessSteps[0].AttributeValues[childIndex].value = parseFloat(itemWeight);
      lotData[0].data[3].ProcessSteps[0].AttributeValues[childIndex].index = childIndex
    }
    if (attribute_id === 4) {
      // scarp
      lotData[0].data[2].ProcessSteps[2].AttributeValues[childIndex].value = parseFloat(itemWeight);
      lotData[0].data[2].ProcessSteps[2].AttributeValues[childIndex].index = childIndex
      let afterTotal = 0
      for (const loss of lotData[0].data[2].ProcessSteps[1].AttributeValues) {
        afterTotal += loss.value
      }
      lotData[0].data[2].ProcessSteps[3].AttributeValues[childIndex].value = lotData[0].data[2].ProcessSteps[0].AttributeValues.length===1 ?(lotData[0].data[2].ProcessSteps[0].AttributeValues[0].value - parseFloat(afterTotal)) - parseFloat(itemWeight):0
    }

    tempData.splice(lotIndex, 1, lotData[0]);
    setItems(tempData);
    console.log('items', items);
  }

  const handleCreateLot = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLotChildItem = (response) => {// count total childItems per lot
    const tempRes = response;
    let item_Total = 0;
    for (const res of tempRes) {
      if (res.scarpBox) {
        item_Total = handleScarpItemTotal(res.scarpBox[0].mechine.scarpDate, tempRes)
        res.scarpBox[0].mechine.itemTotal = item_Total
        res.scarpBox[1].cutting.itemTotal = item_Total
        item_Total = 0;
      }
    }
    return tempRes
  }
  const handleScarpItemTotal = (date, tempRes) => {//add total items
    let totalItem = 0
    let filteredLot = tempRes.filter((item, index) => item.lotDate === date)
    for (const lot of filteredLot) {
      totalItem += lot.data[3].ProcessSteps[0].AttributeValues.length
    }
    return totalItem

  }
  const handleMechineScarp = (value, date) => {
    const updatedItems = [...items]
    for(let i=0;i<updatedItems.length;i++){
        if(updatedItems[i]?.scarpBox){
            if(updatedItems[i]?.scarpBox[0]?.mechine?.scarpDate === date){
             updatedItems[i].scarpBox[0].mechine.scarp=parseFloat(value)
            }
        }
     
    }

    // get matched lots data
    const lotData = updatedItems.filter((item, index) => item.lotDate === String(date))
    let total = 0;
    for (const lot of lotData) {
      lot.data[3].ProcessSteps[2].AttributeValues.forEach((item, index) => {
        total += item.value
      })
    }
    //subtract totalScarp=scarp-totalScarp

    for (const lotScarp of updatedItems) {
    
      if (lotScarp.scarpBox && lotScarp.scarpBox[0].mechine.scarpDate === String(date)) {
        const scarp = Number(lotScarp.scarpBox[0].mechine.scarp);
        lotScarp.scarpBox[0].mechine.totalScarp = total - (isNaN(scarp) ? 0 : scarp);

      }
    }
      console.log('updated items',updatedItems)
      setItems(updatedItems);
   
  };

  const handleCuttingScarp=(value,date,option)=>{
 const updatedItems = [...items]
    for(let i=0;i<updatedItems.length;i++){
        if(updatedItems[i]?.scarpBox){
          if(option==="scarp"){
            if(updatedItems[i]?.scarpBox[1]?.cutting?.scarpDate === date){
               updatedItems[i].scarpBox[1].cutting.scarp=parseFloat(value)
               updatedItems[i].scarpBox[1].cutting.cuttingScarp= parseFloat(value)*updatedItems[i].scarpBox[1].cutting.touch/100
               const lotData = updatedItems.filter((item, index) => item.lotDate === String(date))
             let total = 0;
             for (const lot of lotData) {
                 lot.data[6].ProcessSteps[3].AttributeValues.forEach((item, index) => {
                     total += item.value
                   })}
             
                for (const lotScarp of updatedItems) {
                if (lotScarp.scarpBox && lotScarp.scarpBox[1].cutting.scarpDate === String(date)) {
                      const scarp = Number(lotScarp.scarpBox[1].cutting.cuttingScarp);
                      lotScarp.scarpBox[1].cutting.totalScarp = total - (isNaN(scarp) ? 0 : scarp);
                  }}    

            }
          }else{
            updatedItems[i].scarpBox[1].cutting.touch=parseFloat(value)
            updatedItems[i].scarpBox[1].cutting.cuttingScarp= updatedItems[i].scarpBox[1].cutting.scarp*parseFloat(value)/100
            // add total scarpure

             const lotData = updatedItems.filter((item, index) => item.lotDate === String(date))
             let total = 0;
             for (const lot of lotData) {
                 lot.data[6].ProcessSteps[3].AttributeValues.forEach((item, index) => {
                     total += item.value
                   })}
             
                for (const lotScarp of updatedItems) {
                if (lotScarp.scarpBox && lotScarp.scarpBox[1].cutting.scarpDate === String(date)) {
                      const scarp = Number(lotScarp.scarpBox[1].cutting.cuttingScarp);
                      lotScarp.scarpBox[1].cutting.totalScarp = total - (isNaN(scarp) ? 0 : scarp);
                  }}      
          }
            
        }}

      setItems(updatedItems);  
  }

  const handleSave = async () => {
    try {

      const today = new Date().toISOString().split('T')[0];
      if (initialWeight && touchValue) {
        const response = await createLot(initialWeight, touchValue, today); // Response is an object
        console.log("API Response:", response); // Check structure
        setItems([])
        const tempRes = handleLotChildItem(response)
        console.log('tempRes', tempRes)
        setItems(response)
        console.log('items after save', items) // Ensure prevItems is an array
        setInitialWeight("");
        setTouchValue("");// Clear input field
        setOpen(false);
        setIsLotCreated(true);
        toast.success("Lot Created", { autoClose: 2000 });
      } else {
        toast.warn("Enter Lot Details", { autoClose: 2000 });
      }

    } catch (error) {
      setInitialWeight("");
      setTouchValue("");
      toast.warn('Error On Create Lot', { autoClose: 1500 })
    };
  }

  // console.log("Processes:", processes);

  const handleSaveData = async () => {
    try {
      console.log('handleSaveData', items);
      const res = await saveLot(items);
      console.log('res from save function', res.data.data)
      setItems(res.data.data)
      setCalculation(docalculation(res.data.data))
      handleMachineCalculate(res.data.data, calculation)
      handleCuttingCalculate(res.data.data,calculation)
      toast.success("Lot Saved", { autoClose: 2000 });
    } catch (err) {
      console.log("Enter Lot Information")
    }

  }
  const handleCuttingCalculate = (response, calculation) => {
    const tempData = response;
    const tempCal = [...calculation]
    // calculate cutting loss total
    let cuttingScarpBox_total=0,cuttingLoss_total=0;
    for (const lot of tempData) {
      if (lot.data) {
      
        if(lot.data[6]?.ProcessSteps[2]?.AttributeValues.length>=1){
          cuttingLoss_total+=lot.data[6]?.ProcessSteps[2]?.AttributeValues.reduce((acc,item)=>acc+item.value,0)
        }
      }else{
         cuttingScarpBox_total+=lot.scarpBox[1].cutting.scarp
       }
    }
    console.log('cuttingLossTotal',cuttingLoss_total)
    console.log('cuttingScarpBox',cuttingScarpBox_total)
    
    tempCal[2].process[5].Weight[2].lw = cuttingLoss_total-cuttingScarpBox_total

    // calculate cutting pure total
    let cutting_total = 0;
    for (const lot of tempData) {
      if (lot.scarpBox) {
        cutting_total += lot.scarpBox[1].cutting.totalScarp
      }
    }

    tempCal[2].process[5].Weight[3].pw = cutting_total
    setCalculation(tempCal)

  }
  const handleMachineCalculate = (response, calculation) => {
    const tempData = response;
    const tempCal = [...calculation]
    let total = 0;
    for (const lot of tempData) {
      if (lot.scarpBox) {
        total += lot.scarpBox[0].mechine.totalScarp
      }
    }
    tempCal[2].process[2].Weight[2].lw = total
    setCalculation(tempCal)

  }
  const allData = async () => {
    const res = await getAllLot();
    console.log('useEffect data', res);
    setItems(res)
    setCalculation(docalculation(res))
    console.log('after calculation', calculation);
  }
  const getProduct = async () => {
    const res = await getProductName();
    console.log('getProductName', res);
    setProductName(res)

  }
  const handleChildItems = (lotIndex, lotid, lotDate, attribute_id, value, key, process_id, lotArrIndex) => {
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);
    console.log('child funtionnnnn', attribute_id)
    if (process_id <= 8) {

      // child Items Value Carry Forward here!!!
      if (attribute_id === 3) { //child item After weight Update
        lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value = parseFloat(value);
        lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].index = key
        console.log('console value')
        if (process_id === 4 || process_id === 7) {// its store loss value for
          if (process_id === 7) {//Pure Weight Calculation
              lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].value = lotData[0].data[lotArrIndex].ProcessSteps[0].AttributeValues[key].value-parseFloat(value);
              lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].index = key
              lotData[0].data[lotArrIndex].ProcessSteps[3].AttributeValues[key].value = lotData[0].data[0].ProcessSteps[0].AttributeValues[0].touchValue * lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].value / 100
              lotData[0].data[lotArrIndex].ProcessSteps[3].AttributeValues[key].index = key
               handleScarpBoxTotal(lotDate,process_id)
          } else {
            lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].value = lotData[0].data[lotArrIndex].ProcessSteps[0].AttributeValues[key].value - lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value
            lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].index = key
          }

        } else {
          lotData[0].data[lotArrIndex].ProcessSteps[3].AttributeValues[key].value = lotData[0].data[lotArrIndex].ProcessSteps[0].AttributeValues[key].value - lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value
          lotData[0].data[lotArrIndex].ProcessSteps[3].AttributeValues[key].index = key

        }


        //Before weight carryForward
        if (process_id < 8) {
          lotData[0].data[lotArrIndex + 1].ProcessSteps[0].AttributeValues[key].value = parseFloat(value);
          lotData[0].data[lotArrIndex + 1].ProcessSteps[0].AttributeValues[key].index = key
        }
        if (process_id === 4) {
          lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].value = lotData[0].data[lotArrIndex].ProcessSteps[0].AttributeValues[key].value - lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value
          lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].index = key;
          handleScarpBoxTotal(lotDate,process_id)// calculate totalScarp

        }
        tempData.splice(lotIndex, 1, lotData[0]);
        setItems(tempData);
        console.log('items', items);
      } else if (attribute_id === 4) {//child item Scarp weight Update
        console.log('loggggg')
        lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].value = parseFloat(value);
        lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].index = key;
        lotData[0].data[lotArrIndex].ProcessSteps[3].AttributeValues[key].value = (lotData[0].data[lotArrIndex].ProcessSteps[0].AttributeValues[key].value - lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value) - value
        lotData[0].data[lotArrIndex].ProcessSteps[3].AttributeValues[key].index = key;

        tempData.splice(lotIndex, 1, lotData[0]);
        console.log('lossCalculation', tempData);
        setItems(tempData);
      }

    } else { //last process after weight
      if (process_id === 8) {

        if (attribute_id === 3) {
          lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value = parseFloat(value);
          lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].index = key
          lotData[0].data[lotArrIndex].ProcessSteps[3].AttributeValues[key].value = lotData[0].data[lotArrIndex].ProcessSteps[0].AttributeValues[key].value - lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value
          lotData[0].data[lotArrIndex].ProcessSteps[3].AttributeValues[key].index = key;
          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData);
          console.log('items', items);
        } else if (attribute_id === 4) {
          lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].value = parseFloat(value);
          lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].index = key;
          lotData[0].data[lotArrIndex].ProcessSteps[3].AttributeValues[key].value = (lotData[0].data[lotArrIndex].ProcessSteps[0].AttributeValues[key].value - lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value) - value
          lotData[0].data[lotArrIndex].ProcessSteps[3].AttributeValues[key].index = key;
          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData);
        }
      }
    }

  }
 
  const  handleScarpBoxTotal = (lotDate,process_id) => {
    const tempData = [...items]
    const lotData = tempData.filter((item, index) => item.lotDate === String(lotDate))
    let total = 0;
    for (const lot of lotData) {
       if(process_id===4){// calculate mechine loss total
          lot.data[3].ProcessSteps[2].AttributeValues.forEach((item, index) => {
           total += item.value
        })
       }else{// calculate cutting scarppure total
        lot.data[6].ProcessSteps[3].AttributeValues.forEach((item, index) => {
           total += item.value
        })
       }
    }
    //assign totalScarp value
    for (const lotScarp of tempData) {
       if(process_id===4){
         if (lotScarp.scarpBox && lotScarp.scarpBox[0].mechine.scarpDate === String(lotDate)) {
         lotScarp.scarpBox[0].mechine.totalScarp = total
        }
       }else{
         if (lotScarp.scarpBox && lotScarp.scarpBox[1].cutting.scarpDate === String(lotDate)) {
         lotScarp.scarpBox[1].cutting.totalScarp = total
      }
       }
    }
    setItems(tempData)
  }
  const handleTotal = (lotid, lotProcessId, processId) => {
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);

    const totalValue = lotData[0]?.data[lotProcessId]?.ProcessSteps[processId]?.AttributeValues.reduce(
      (acc, item) => acc + item.value,
      0
    );

    return totalValue;
  }
 
  const handleDateWiseFilter = async () => {
    try {
      console.log('fromDate', fromDate);
      console.log('toDate', toDate);


      if (fromDate > toDate) {
        alert('Your Date Order was Wrong');
        return;
      }
      setItems([])
     
      const res = await getLotDatewise(fromDate, toDate);
      console.log('DateWiseFilter', res.data.data);
      // const tempRes=handleLotChildItem(res.data.data)
 
      setItems(res.data.data)
      setCalculation(docalculation(res.data.data))
      handleMachineCalculate(items, calculation)
      handleCuttingCalculate(items,calculation)
      getProduct()
      console.log('itemsAfterDateWiseFilter', items);
    } catch (error) {
      console.error('Error fetching data by date:', error.message);
      alert('Select Date First.');
    }
  };
  // useEffect(() => {
  //   const today = new Date();
  //   const year = today.getFullYear();
  //   const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  //   const day = String(today.getDate()).padStart(2, '0');

  //   const currentDate = `${year}-${month}-${day}`;
  //   console.log('currentDate', currentDate);

  //   setFromDate(currentDate);
  //   setToDate(currentDate);
  // }, []);

  useEffect(() => {
    // Get current date in UTC
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];
    setFromDate(formattedDate);
    setToDate(formattedDate);
  }, []);



  useEffect(() => {
    allData()
    getProduct()

  }, [])
  useEffect(() => {
    const response = handleLotChildItem(items)
    console.log('childItemTotal', response)
    setItems(response)
    setCalculation(docalculation(items))
    handleMachineCalculate(items, calculation)
    handleCuttingCalculate(items,calculation)

  }, [items])

  const billRef = useRef(null);

  const tableRef = useRef(null);

  return (
    <Box sx={{ padding: "20px" }} ref={billRef}>
      <Box sx={{ textAlign: "right", marginBottom: "0px" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateLot}
          sx={{ marginRight: "10px" }}

        >
          AddItem
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSaveData}
          sx={{ marginRight: "10px" }}

        >
          Save
        </Button>

      </Box>
      {/* DateWiseFilter */}

      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: 0, position: 'relative' }}>
          <TextField
            label="From Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <TextField
            label="To Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <Button variant="contained" onClick={() => { handleDateWiseFilter() }}>Filter</Button>
        </div>
      </div>


      <StyledTableContainer component={Paper} >
        <div ref={tableRef} style={{ position: 'relative', overflow: 'auto', maxHeight: '57vh' }}>

          <Table >
            <TableHead style={{ position: 'sticky', top: "0px", zIndex: 10, backgroundColor: '#d8e3e6', }}  >

              <TableRow>
                <StyledTableCell style={{
                  borderRight: "3px solid black",

                }}>
                  <b>Raw Gold</b>
                </StyledTableCell>
                <StyledTableCell style={{
                  borderRight: "3px solid black",

                }} >
                  <b>Touch</b>
                </StyledTableCell >
                {processes.map((process) => {
                  let colSpanValue = 4;

                  if (process === "Cutting") {
                    colSpanValue = 4;
                  }
                  if (process === "Wire") {
                    colSpanValue = 6
                  }
                  else if (process === "Machine") {
                    colSpanValue = 3;
                  }

                  return (
                    <StyledTableCell key={process} colSpan={colSpanValue} style={{
                      borderRight: "3px solid black",

                    }}>
                      <b>{process}</b>
                    </StyledTableCell>
                  );
                })}


                <StyledTableCell style={{
                  borderRight: "3px solid black",

                }}>
                  <b>Item Diffrent</b>
                </StyledTableCell>
                <StyledTableCell style={{
                  borderRight: "3px solid black",

                }} >
                  <b>Total Diffrent</b>
                </StyledTableCell >


              </TableRow>
              <TableRow>
                <StyledTableCell colSpan={2} />
                {processes.map((process) => (

                  <React.Fragment key={process}>
                    <StyledTableCell >
                      <b>Before</b>
                    </StyledTableCell>

                    {process === "Wire" && (
                      <>
                        <StyledTableCell >
                          <b>Action</b>
                        </StyledTableCell>

                      </>
                    )}
                    {process === "Wire" ? (
                      <StyledTableCell colSpan={2} >
                        <b>After</b>
                      </StyledTableCell>) :
                      (<StyledTableCell >
                        <b>After</b>
                      </StyledTableCell>)}

                    {process === "Machine" || process === "Cutting" ? ("") : (<StyledTableCell >
                      <b>Scarp</b>
                    </StyledTableCell>)}


                    {process === "Soldrine" || process==="Joint"?  (
                      <StyledTableCell style={{
                        borderRight: "3px solid black",

                      }} >
                        <b>+</b>
                      </StyledTableCell>): (
                      <StyledTableCell style={{
                        borderRight: process === "Cutting" ? "none" : "3px solid black"
                      }} >
                        <b>{process === "Cutting" ? "Scarp" : "loss"}</b>
                      </StyledTableCell>)} 

                    {
                      process === "Cutting" && (
                        <StyledTableCell style={{
                          borderRight: "3px solid black",
                        }} >
                          <b>Scarp Pure</b>
                        </StyledTableCell>
                      )
                    }
                  </React.Fragment>
                ))}
                <StyledTableCell style={{ borderRight: "3px solid black", }} />
                <StyledTableCell style={{ borderRight: "3px solid black", }} />

              </TableRow>
            </TableHead>
             <TableBody >
              {
                items.map((lotItem, lotIndex) => (
                  lotItem.data ? (
                    <React.Fragment key={lotIndex} >
                      <TableRow >
                        <StyledTableCell style={{borderRight: "3px solid black",}}>
                          <StyledInput
                            value={//RawGold Input Box
                              typeof lotItem.data[0].ProcessSteps[0].AttributeValues[0].value === "number"
                                ? lotItem.data[0].ProcessSteps[0].AttributeValues[0].value
                                : ""
                            }
                            onChange={(e) =>
                              handleInitialChange(lotItem.lotid, lotIndex, e.target.value)
                            }
                            type="number"
                            style={{ width: "120px" }}
                            autoComplete="off"
                          />


                        </StyledTableCell>
                        <StyledTableCell style={{borderRight: "3px solid black",}}>
                          <StyledInput
                            value={lotItem.data[0].ProcessSteps[0].AttributeValues[0].touchValue || " "}
                            onChange={(e) => {
                              handleTouchChange(lotItem.lotid, lotIndex, e.target.value)
                            }}
                            type="number"
                            style={{ width: "120px" }}
                            autoComplete="off"
                          />
                        </StyledTableCell>

                        {lotItem.data.map((lotArr, lotArrIndex) =>
                          lotItem.data[lotArrIndex + 1] && lotItem.data[lotArrIndex + 1].ProcessSteps ? (
                            lotArrIndex === 0 ? (
                              <React.Fragment key={lotArrIndex}>
                                <StyledTableCell>
                                  <StyledInput 
                                    value={
                                      typeof lotItem.data[lotArrIndex + 1]?.ProcessSteps[0]?.AttributeValues[0]?.value === "number"
                                        ? lotItem.data[lotArrIndex + 1].ProcessSteps[0].AttributeValues[0].value.toFixed(3)
                                        : ""
                                    }
                                    style={{ width: "120px" }}
                                  />

                                </StyledTableCell>

                                <StyledTableCell >
                                  <StyledInput 
                                    value={
                                      lotItem.data[lotArrIndex + 1]?.ProcessSteps[1]?.AttributeValues[0]?.value
                                    }
                                    onChange={(e) => handleSingleItem(lotArrIndex, lotItem.lotid,
                                      lotItem.data[lotArrIndex + 1]?.ProcessSteps[1]?.process_id,
                                      lotItem.data[lotArrIndex + 1]?.ProcessSteps[1]?.AttributeInfo.attribute_id,
                                      e.target.value, lotIndex)}
                                    type="number"
                                    autoComplete="off"
                                    style={{ width: "120px" }}
                                    inputRef={melting(lotItem.lotid, 'meltingAfter')}
                                    onKeyDown={(e) => handleKeyDown(e, lotItem.lotid, 'meltingAfter')}
                                  />
                                </StyledTableCell>

                                {lotItem.data[lotArrIndex + 1].process_name !== "mechine" ? (
                                  <StyledTableCell>
                                    <StyledInput 
                                      value={
                                        lotItem.data[lotArrIndex + 1]?.ProcessSteps[2]?.AttributeValues[0]?.value 
                                      }
                                      onChange={(e) => handleSingleItem(lotArrIndex, lotItem.lotid,
                                        lotItem.data[lotArrIndex + 1]?.ProcessSteps[2]?.process_id,
                                        lotItem.data[lotArrIndex + 1]?.ProcessSteps[2]?.AttributeInfo.attribute_id,
                                        e.target.value, lotIndex)}
                                      type="number"
                                      autoComplete="off"
                                      style={{ width: "120px" }}
                                      inputRef={melting(lotItem.lotid, 'meltingScarp')}

                                    />
                                  </StyledTableCell>) : ("")}

                                <StyledTableCell style={{ borderRight: "3px solid black" }}>

                                  <StyledInput 
                                    value={
                                      typeof lotItem.data[lotArrIndex + 1]?.ProcessSteps[3]?.AttributeValues[0]?.value === "number"
                                        ? lotItem.data[lotArrIndex + 1].ProcessSteps[3].AttributeValues[0].value.toFixed(3)
                                        : ""
                                    }
                                    style={{ width: "120px" }}
                                  />
                                </StyledTableCell>

                              </React.Fragment>) : (" ")
                          ) : null

                        )}
                        {
                          <React.Fragment>

                            <StyledTableCell>
                              <StyledInput 
                                value={
                                  typeof lotItem.data[2]?.ProcessSteps[0]?.AttributeValues[0]?.value === "number"
                                    ? lotItem.data[2].ProcessSteps[0].AttributeValues[0].value.toFixed(3)
                                    : ""
                                }
                                style={{ width: "120px" }}
                              />
                            </StyledTableCell>
                            <StyledTableCell>
                              <Button
                                variant="contained"
                                color="secondary"
                                size="small"  
                                onClick={() => handleAddItemColumns(lotItem.lotid, lotIndex)}
                                style={{ minWidth: "32px", padding: "4px" }} 
                              >
                                <AddIcon fontSize="small" />
                              </Button>
                            </StyledTableCell>

                            
                             <StyledTableCell colSpan={4} style={{ borderRight: "3px solid black" }} />
                             <StyledTableCell colSpan={3} style={{ borderRight: "3px solid black" }} />
                             <StyledTableCell colSpan={4} style={{ borderRight: "3px solid black" }} />
                             <StyledTableCell colSpan={4} style={{ borderRight: "3px solid black" }} />
                             <StyledTableCell colSpan={4} style={{ borderRight: "3px solid black" }} />
                             <StyledTableCell colSpan={4} style={{ borderRight: "3px solid black" }} /> 
                              <StyledTableCell style={{ borderRight: "3px solid black" }} /> 

                          </React.Fragment>
                        }

                        {
                          lotItem.data[7]?.ProcessSteps[1]?.AttributeValues.length >= 1 ? (
                            <StyledTableCell >
                              <b>{(lotItem.data[0].ProcessSteps[0].AttributeValues[0].value - handleTotal(lotItem.lotid, 7, 1)).toFixed(3)}</b>
                            </StyledTableCell>
                          ) : (<StyledTableCell></StyledTableCell>)
                        }
                      </TableRow>


                      {
                        lotItem.data[2].ProcessSteps[1].AttributeValues.map((item, key) => ( 
                          //
                          <TableRow key={key} >
                          <StyledTableCell colSpan={8}></StyledTableCell>
                            <Autocomplete
                              style={{ margin: "10px" }}
                              options={productName}
                              getOptionLabel={(option) => option.jewel_name || ""}
                              value={{
                                jewel_name: lotItem.data[2]?.ProcessSteps[1]?.AttributeValues[key].item_name || "",
                                master_jewel_id: lotItem.data[2]?.ProcessSteps[1]?.AttributeValues[key].master_jewel_id || "",
                              }}
                              onChange={(event, newValue) => {
                                if (newValue) {
                                  handleChildItemName(
                                    lotItem.lotid,
                                    key,
                                    newValue.jewel_name,
                                    lotIndex,
                                    newValue.master_jewel_id,
                                    lotItem.data[0]?.ProcessSteps[0]?.AttributeValues[0].touchValue
                                  );
                                }
                              }}
                              isOptionEqualToValue={(option, value) =>
                                option.master_jewel_id === value.master_jewel_id
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Item"
                                  size="small"
                                  sx={{ width: "150px", fontSize: "14px" }}
                                />
                              )}
                            />

                            <StyledTableCell >
                              <StyledInput
                                value={lotItem.data[2]?.ProcessSteps[1]?.AttributeValues[key].value}
                                placeholder="Weight"
                                onChange={(e) => { handleChildItemWeight(lotItem.lotid, key, e.target.value, lotIndex, lotItem.data[2]?.ProcessSteps[1]?.AttributeInfo.attribute_id) }}
                                type="number" style={{ width: "120px" }} autoComplete="off"

                                inputRef={wiring(lotItem.lotid, 'wiringAfter')}
                                onKeyDown={(e) => handleKeyDown(e, lotItem.lotid, 'wiringAfter')}
                              />
                            </StyledTableCell>

                            {key === 0 && (
                              <>
                                <StyledTableCell rowSpan={lotItem.data[2].ProcessSteps[1].AttributeValues.length}>

                                  <StyledInput
                                    value={
                                      lotItem.data[2]?.ProcessSteps[2]?.AttributeValues[0]?.value
                                    }
                                    type="number" style={{ width: "120px" }} autoComplete="off"
                                    onChange={(e) => { handleChildItemWeight(lotItem.lotid, key, e.target.value, lotIndex, lotItem.data[2]?.ProcessSteps[2]?.AttributeInfo.attribute_id) }}
                                    inputRef={wiring(lotItem.lotid, 'wiringScarp')}
                                    onKeyDown={(e) => handleKeyDown(e, lotItem.lotid, 'wiringScarp')}
                                  ></StyledInput>
                                </StyledTableCell>
                                <StyledTableCell rowSpan={lotItem.data[2].ProcessSteps[1].AttributeValues.length} style={{ borderRight: "3px solid black" }}>
                                  <StyledInput
                                    value={
                                      typeof lotItem.data[2]?.ProcessSteps[3]?.AttributeValues[0]?.value === "number"
                                        ? lotItem.data[2].ProcessSteps[3].AttributeValues[0].value.toFixed(3)
                                        : ""
                                    }


                                    style={{ width: "120px" }} autoComplete="off"
                                  ></StyledInput>
                                </StyledTableCell>
                              </>
                            )}
                            {
                              lotItem.data.map((lotArr, lotArrIndex) => (
                                lotArrIndex >= 3 ? (
                                  <React.Fragment key={key}>
                                       {/* before weight */}
                                    <StyledTableCell> 
                                      <StyledInput
                                        value={
                                          typeof lotItem.data[lotArrIndex]?.ProcessSteps[0]?.AttributeValues[key]?.value === "number"
                                            ? lotItem.data[lotArrIndex].ProcessSteps[0].AttributeValues[key].value
                                            : ""
                                        }


                                        style={{ width: "120px" }}

                                      ></StyledInput>
                                    </StyledTableCell>
                                    {/* After weight */}
                                    <StyledTableCell>
                                      <StyledInput
                                        value={lotItem.data[lotArrIndex]?.ProcessSteps[1]?.AttributeValues[key]?.value}
                                        onChange={(e) => {
                                          handleChildItems(
                                            lotIndex,
                                            lotItem.lotid,
                                            lotItem.lotDate,
                                            lotItem.data[lotArrIndex]?.ProcessSteps[1]?.AttributeInfo.attribute_id,
                                            e.target.value,
                                            key,
                                            lotItem.data[lotArrIndex]?.ProcessSteps[1].process_id,
                                            lotArrIndex

                                          )
                                        }}
                                        type="number"
                                        style={{ width: "120px" }}
                                        autoComplete="off"
                                        inputRef={mechine(lotItem.lotid, lotItem.data[lotArrIndex]?.process_name + "After", key)}
                                        onKeyDown={(e) => handleKeyDown(e, lotItem.lotid, lotItem.data[lotArrIndex]?.process_name + "After", key)}
                                      ></StyledInput>
                                    </StyledTableCell>
                                    {/* scarp */}
                                    {lotItem.data[lotArrIndex]?.process_name === "mechine" || lotItem.data[lotArrIndex]?.process_name === "cutting" ? 
                                     null: (  
                                     <StyledTableCell>
                                        <StyledInput
                                          value={lotItem.data[lotArrIndex]?.ProcessSteps[2]?.AttributeValues[key]?.value}
                                          onChange={(e) => {
                                            handleChildItems(
                                              lotIndex,
                                              lotItem.lotid,
                                              lotItem.lotDate,
                                              lotItem.data[lotArrIndex]?.ProcessSteps[2]?.AttributeInfo.attribute_id,
                                              e.target.value, key,
                                              lotItem.data[lotArrIndex]?.ProcessSteps[2].process_id,
                                              lotArrIndex

                                            )
                                          }}
                                          type="number"
                                          style={{ width: "120px" }}
                                          autoComplete="off"
                                          inputRef={mechine(lotItem.lotid, lotItem.data[lotArrIndex]?.process_name + "Scarp", key)}
                                          onKeyDown={(e) => handleKeyDown(e, lotItem.lotid, lotItem.data[lotArrIndex]?.process_name + "Scarp", key)}
                                        ></StyledInput>
                                      </StyledTableCell>)
                                      }
                                    {/* loss */}
                                    <StyledTableCell style={{ borderRight: lotItem.data[lotArrIndex]?.process_name === "cutting" ? "none" : "3px solid black" }}>
                                      {lotItem.data[lotArrIndex]?.process_name === "mechine" || lotItem.data[lotArrIndex]?.process_name === "cutting"? (
                                        <StyledInput
                                          value={
                                            typeof lotItem.data[lotArrIndex]?.ProcessSteps[2]?.AttributeValues[key]?.value === "number"
                                              ? lotItem.data[lotArrIndex].ProcessSteps[2].AttributeValues[key].value.toFixed(3)
                                              : ""
                                          }
                                          style={{ width: "120px" }}

                                        />) : (<StyledInput 
                                          value={
                                            typeof lotItem.data[lotArrIndex]?.ProcessSteps[3]?.AttributeValues[key]?.value === "number"
                                              ? lotItem.data[lotArrIndex].ProcessSteps[3].AttributeValues[key].value.toFixed(3)
                                              : ""
                                          }
                                          style={{ width: "120px" }}

                                        />)}

                                    </StyledTableCell>
                                      {/* scarpPure */}
                                    {lotArrIndex === 6 ? (
                                      <StyledTableCell style={{ borderRight: "3px solid black" }}>
                                        <StyledInput
                                          value={
                                            typeof lotItem.data[lotArrIndex]?.ProcessSteps[3]?.AttributeValues[key]?.value === "number"
                                              ? lotItem.data[lotArrIndex]?.ProcessSteps[3].AttributeValues[key].value.toFixed(3)
                                              : ""
                                          }
                                          style={{ width: "120px" }}

                                        ></StyledInput>
                                      </StyledTableCell>
                                    ) : (" ")
                                    }

                                  </React.Fragment>
                                ) : (" ")
                              ))
                            }


                            {
                              
                              lotItem.data[7]?.ProcessSteps[1]?.AttributeValues[key]?.value ?
                                (<StyledTableCell style={{ borderRight: "3px solid black" }}>
                                  <p style={{ fontSize: "15px" }}>{(lotItem.data[2]?.ProcessSteps[1]?.AttributeValues[key]?.value - lotItem.data[7]?.ProcessSteps[1]?.AttributeValues[key].value).toFixed(3)}</p>
                                </StyledTableCell>)
                                : (<StyledTableCell style={{ borderRight: "3px solid black" }}></StyledTableCell>)
                            }
                            <StyledTableCell style={{ borderTop: "2px solid white", }}></StyledTableCell> 

                          </TableRow>

                        ))
                      }

                       <TableRow >
                        <StyledTableCell colSpan={8}></StyledTableCell>

                        <StyledTableCell>-</StyledTableCell>
                        {
                          lotItem.data[2].ProcessSteps[1].AttributeValues.length !== 0 ? ( 
                            <StyledTableCell>{"Total:" + (handleTotal(lotItem.lotid, 2, 1)).toFixed(3)}</StyledTableCell>
                          ) : (<StyledTableCell>Total:0</StyledTableCell>)
                        }
                        <StyledTableCell></StyledTableCell>
                        <StyledTableCell  style={{borderRight: "3px solid black",}}></StyledTableCell>


                        {
                          lotItem.data.map((item, index) => (
                            index >= 3 && index <= 7 ? (
                              <React.Fragment>
                                <StyledTableCell></StyledTableCell>

                                <StyledTableCell>
                                  {
                                    index === 7 ? (lotItem.data[7].ProcessSteps[1].AttributeValues.length !== 0 ? (
                                      "Total:" + handleTotal(lotItem.lotid, 7, 1)
                                    ) : ("")) : ("")

                                  }
                                </StyledTableCell>
                                {
                                  index === 3 ||  index === 6 ?("") : (<StyledTableCell></StyledTableCell>)
                                }
                                <StyledTableCell style={{ borderRight: lotItem.data[index]?.process_name === "cutting" ? "none" : "3px solid black" }}></StyledTableCell>
                                {
                                  index === 6 ? (<StyledTableCell style={{ borderRight: "3px solid black" }}></StyledTableCell>) : ("")
                                }

                              </React.Fragment>
                            ) : (" ")

                          ))
                        }
                        <StyledTableCell style={{ borderRight: "3px solid black" }}></StyledTableCell>
                        <StyledTableCell></StyledTableCell>
                      </TableRow> 
                    </React.Fragment>) :
                    (
                      <React.Fragment>
                         <TableRow>
                          <StyledTableCell colSpan={12}></StyledTableCell>
                          {/*  mechine scarpBox */}
                          <StyledTableCell colSpan={3} style={{
                            borderLeft: "3px solid black",   
                            borderRight: "3px solid black", 
                            borderTop: "none",               
                            borderBottom: "none"             
                          }} >
                            <Grid container spacing={1}>

                              <Grid container item spacing={1}>
                                <Grid item xs={6} display="flex" alignItems="center">
                                   <TextField
                                    label="Date"
                                    value={lotItem.scarpBox[0].mechine.scarpDate}
                                  >

                                   </TextField>
                                 
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField fullWidth size="small" label="ItemTotal"
                                    value={lotItem.scarpBox[0].mechine.itemTotal}
                                  />
                                </Grid>
                              </Grid>


                              <Grid container item spacing={1}>
                                <Grid item xs={6}>
                                  <TextField fullWidth size="small" value={lotItem.scarpBox[0].mechine?.scarp} label="Scarp" type="number" onChange={(e) => {handleMechineScarp(e.target.value, lotItem.scarpBox[0].mechine?.scarpDate) }} autoComplete="off" />
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField fullWidth size="small" label="Loss" value={(lotItem.scarpBox[0].mechine?.totalScarp).toFixed(3)} />
                                </Grid>
                              </Grid>
                            </Grid>
                          </StyledTableCell>
                          <StyledTableCell colSpan={8}></StyledTableCell>
                          {/* cutting scarpBox */}
                          <StyledTableCell colSpan={4} style={{
                            borderLeft: "3px solid black",   
                            borderRight: "3px solid black", 
                            borderTop: "none",               
                            borderBottom: "none"             
                          }} >
                            <Grid container spacing={1}>

                              <Grid container item spacing={1}>
                                <Grid item xs={6} display="flex" alignItems="center">
                                   <TextField
                                    label="Date"
                                    value={lotItem.scarpBox[1].cutting?.scarpDate}
                                  >

                                   </TextField>
                                 
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField fullWidth size="small" label="ItemTotal"
                                    value={lotItem.scarpBox[1].cutting?.itemTotal}
                                  />
                                </Grid>
                              </Grid>


                              <Grid container item spacing={1}>
                                <Grid item xs={6}>
                                  <TextField fullWidth size="small" value={lotItem.scarpBox[1].cutting?.scarp} label="GivenScarp" type="number" 
                                   onChange={(e) => {handleCuttingScarp(e.target.value, lotItem.scarpBox[1].cutting?.scarpDate,"scarp") }} 
                                   inputRef={cuttingBox(`${lotItem.scarpBox[1].cutting?.lot_id}_${lotItem.scarpBox[1].cutting?.scarpDate}`, 'cuttingBoxScarp')}
                                   onKeyDown={(e) => handleKeyCutting(e,`${lotItem.scarpBox[1].cutting?.lot_id}_${lotItem.scarpBox[1].cutting?.scarpDate}`, 'cuttingBoxScarp')}
                                  autoComplete="off" />
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField fullWidth size="small" value={lotItem.scarpBox[1].cutting?.touch} label="Giventouch" 
                                  type="number"
                                  onChange={(e) => {handleCuttingScarp(e.target.value, lotItem.scarpBox[1].cutting?.scarpDate,"touch") }} 
                                  inputRef={cuttingBox(`${lotItem.scarpBox[1].cutting?.lot_id}_${lotItem.scarpBox[1].cutting?.scarpDate}`, 'cuttingBoxTouch')}
                                  onKeyDown={(e) => handleKeyCutting(e, `${lotItem.scarpBox[1].cutting?.lot_id}_${lotItem.scarpBox[1].cutting?.scarpDate}`, 'cuttingBoxTouch')}
                                  autoComplete="off" />
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField fullWidth size="small" value={lotItem.scarpBox[1].cutting?.cuttingScarp} label="GivenScarpPure" type="number"  autoComplete="off" />
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField fullWidth size="small" label="BalanceScarpPure" value={(lotItem.scarpBox[1].cutting?.totalScarp).toFixed(3)} />
                                </Grid>
                              </Grid>
                            </Grid>
                          </StyledTableCell>

                        </TableRow> 
                      </React.Fragment>


                    )

                ))
              }
            </TableBody> 
             <TableFooter>
              <StyledTableCell><p style={{ fontSize: "17px", fontWeight: "bold", color: "black" }}>Total RawGold:{(calculation[0].rawGold).toFixed(3)}</p></StyledTableCell>
              <StyledTableCell><p ></p></StyledTableCell>
              {
                calculation[2].process.map((item, key) => (
                  <>

                    <StyledTableCell><StyledInput ></StyledInput></StyledTableCell>

                    <StyledTableCell>
                      <p style={{ fontSize: "17px", fontWeight: "bold", color: "black" }}>
                        {item.processName === 'Finishing' ? `FinishTotal  ${(item.Weight[1].aw).toFixed(3)}` : ""}
                      </p>
                    </StyledTableCell>
                    {item.processName === 'Wire' ? (
                      <>
                        <StyledTableCell></StyledTableCell>
                        <StyledTableCell></StyledTableCell>
                      </>) : ("")}
                    {
                      item.processName === "Machine" || item.processName === "Cutting" ? (""):(<StyledTableCell><p style={{ fontSize: "17px", fontWeight: "bold", color: "black" }}>{item.processName}<br />ScarpTotal:{(item.Weight[2].sw).toFixed(3)}</p></StyledTableCell>)
                    }
                    <StyledTableCell><p style={{ fontSize: "17px", fontWeight: "bold", color: "black" }}>{item.processName}<br />LossTotal:{item.processName === "Machine" || item.processName === "Cutting" ? (item.Weight[2].lw).toFixed(3) : (item.Weight[3].lw).toFixed(3)}</p></StyledTableCell>
                    {
                      item.processName === "Cutting" ? (<StyledTableCell><p style={{ fontSize: "17px", fontWeight: "bold", color: "black" }}>{item.processName}<br />PureTotal:{(item.Weight[3].pw).toFixed(3)}</p></StyledTableCell>) : ("")
                    }



                  </>
                ))
              }
              <StyledTableCell></StyledTableCell>
              <StyledTableCell><p style={{ fontSize: "17px", fontWeight: "bold", color: "black" }}>LotTotal:{(calculation[3].lotTotal).toFixed(3)}</p></StyledTableCell>
            </TableFooter> 
          </Table>
          <ToastContainer />
        </div>
      </StyledTableContainer>
      {/* <Button variant="contained" color="primary" onClick={handleDownloadPdf}>
        Download as PDF
      </Button>
      <Button variant="contained" onClick={exportToExcel} style={{ marginLeft: '1rem' }}>Excel</Button> */}

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            Enter Initial Weight
          </Typography>
          <TextField
            fullWidth
            label="Initial Weight"
            value={initialWeight}
            onChange={(e) => setInitialWeight(e.target.value)}
            autoComplete="off"
            sx={{ mt: 2 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                touchRef.current.focus()
              }
            }}
          />
          <Typography variant="h6" component="h2">
            Touch Weight
          </Typography>
          <TextField
            fullWidth
            label="Touch Weight"
            value={touchValue}
            onChange={(e) => setTouchValue(e.target.value)}
            sx={{ mt: 2 }}
            autoComplete="off"
            inputRef={touchRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveRef.current.focus()
              }
            }}
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleClose} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave} ref={saveRef} >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>

  );
};

export default ProcessTable;









