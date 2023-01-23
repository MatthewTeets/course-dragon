import { groupBy, isDarkBackground, compareSemesters } from './functions.js';
import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FlowChartItem from './FlowChartItem.jsx';

/*** Displays the flowchart view of the web app ***/
function FlowChart(props) {

  let [curPrereqs, setPrereqs] = useState([]);
  let [displayAll, setDisplayAll] = useState(false);

  /*** Calculates amount of credit hours that are needed for a list of flowchart classes
   * And the total number of credit hours that have been taken from the classes
   * Takes: list of flowchart classes ***/
  const calculateSemHours = classList => {
    let [total, taken] = [0, 0];
    for (let cl of classList) {
      total += parseInt(cl.Credits);
      taken += cl.taken ? parseInt(cl.cl.Credits) : 0; // if taken add to count
    }
    return [taken, total];
  }

  // convenient function to allow for easy ordering by color (when passed to the sortby function)
  const byColor = (a, b) => props.ColorOrder.indexOf(a) - props.ColorOrder.indexOf(b);

  // maps each color to a div to be displayed 
  let legend = Object.entries(props.Colors).sort((a, b) => byColor(a[0], b[0])).map(([name, color]) => (
    <div
      key={'legend' + name}
      className="flow-box-legend"
      style={{
        backgroundColor: color, 
        color: isDarkBackground(color) ? "#000000" : "#ffffff"
      }}>
      {name}
    </div>
  ));

  // get classes grouped by semester (using global function)
  let semClasses = Object.fromEntries(props.Semesters.map(s => [s, []]));
  semClasses = {...semClasses, ...groupBy(props.Classes, x => x.Semester)};
  // get classes grouped by semester to be grouped by year
  let yearSems = groupBy(Object.entries(semClasses), x => x[0].split('-')[1]);
  // returns html for entire flowchart 
  return (
    <React.Fragment>
      <div className='expand'>
        <InputGroup className='class-checkbox'>
          <InputGroup.Checkbox
            aria-label="Expand All Flowchart Boxes"
            onChange={() => setDisplayAll(!displayAll)}
          />
        </InputGroup>
        Expand All Flowchart Boxes
      </div>
      <Container fluid id='flowchart'>
        <Row>
          {/* the drag-n-drop functionality uses the react beautiful drag-n-drop library and is handled within the DragDropContext tags which calls the handleOnDragEnd function in the App component to update the state. */}
          <DragDropContext onDragEnd={props.onDragEnd}>
          {// create all of the html code for the years by mapping each entry to the code
           //  uses map to loop and extract year number in 'year' and list of semesters in 'sems'
            Object.entries(yearSems).map(([year, sems]) => (
            // makes new column for each year with table inside for semesters
              <Col key={'colyear' + year} lg={3} sm={6} s={12} className='yearcol'>
                <Container>
                  <Row><Col className='year-header'>Year {year}</Col></Row>
                  <Row className='sem-classes'>{
                    /* sort the semesters alphabetically, so that Fall always comes before Spring
                    uses map to loop and extract semester string in 'sem' and list of classes in 'classes'*/
                    sems.sort((a, b) => -compareSemesters(a[0], b[0])).map(([sem, classes]) => (
                      <Droppable key={sem} droppableId={sem}>
                        {(provided) => (
                        /* Col: column tag, imported from bootstrap-react 
                        key attribute is used as a unique identifier for an item in a list in react */
                        <Col {...provided.droppableProps} ref={provided.innerRef} md={6} xs={6} className='semcol'>
                        <div className='sem-header'>{sem.split('-')[0]}</div>
                        <div className='sem-credits'>{calculateSemHours(classes).join(' / ') + ' credits taken'}</div>
                        {classes.sort((a,b) => byColor(a.Color, b.Color)).map((cl, i) => (
                          /* used <Droppable> tag to identify area where classes can be placed (surrounded around each semester columns), <Draggable> tag to identify the classes that can be dragged. link to implementing drag and drop: https://www.freecodecamp.org/news/how-to-add-drag-and-drop-in-react-with-react-beautiful-dnd/*/
                          <Draggable key={cl.index.toString()} draggableId={cl.index.toString()} index={i}>
                            {(provided) => (
                              // Draggable ref & properties in div surrounding flowchart item for ref to work and to note which items can be dragged in the flowchart view
                              // FlowChartItem tag renders a box with all the information about the class
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>   
                                <FlowChartItem 
                                  {...cl}
                                  isPreReq={curPrereqs.includes(cl.Name)}
                                  enterFunc={() => setPrereqs((!!cl.cl && !!cl.cl.Prereqs) ? cl.cl.Prereqs : [])}
                                  leaveFunc={() => setPrereqs([])}
                                  displayAll={displayAll}
                                ></FlowChartItem>
                              </div>
                            )}
                          </Draggable>
                          ))}
                          {/* To keep everything in place when dragging around classes */}
                          {provided.placeholder}
                        </Col>
                      )}
                      </Droppable>
                    ))}</Row>
                </Container>
              </Col>))}
          </DragDropContext>
        </Row>
        <div className="flow-legend">
          {legend}
        </div>
      </Container>
    </React.Fragment>
  );
}

export default FlowChart;
