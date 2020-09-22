$(document).ready(ready_form(),getHospital(),get_list());

function get_list(){  
  $.ajax({
    url: `/list/${document.getElementById('pt_id').value}/`,
    type:   'GET',
    success: function(data){
        document.getElementById('book').innerHTML=data[0];
        document.getElementById('completed_count').innerHTML=data[1];
        document.getElementById('upcoming_count').innerHTML=data[2];
        document.getElementById('waiting_count').innerHTML=data[3];
        document.getElementById('rejected_count').innerHTML=data[4];
        
     },
    error: function() {
      toastr.error('Something went wrong');; 
    }
    });
}

function tabchange(tab_id){
var tab=document.getElementById(tab_id);
tab.click();
}

function ready_form(){
var days=2;  // max days ahead booking
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
  document.getElementById('book_date').min=today;
  var new_date = new Date();
  new_date.setDate(new_date.getDate() + days); 
  dd = String(new_date.getDate()).padStart(2, '0');
  mm = String(new_date.getMonth() + 1).padStart(2, '0'); //January is 0!
  yyyy = new_date.getFullYear();
  var max_date=yyyy + '-' + mm + '-' + dd;
  document.getElementById('book_date').max=max_date;
}

// get hospital list

function getHospital(){
    document.getElementById('load1').style.display='flex';
    $.ajax({
        url: `/listHospital/`,
        type:   'GET',
        success: function(data){
            document.getElementById('load1').style.display='none';
           var hospital_ele=document.getElementById('hospital-list') ;
           var i;
           for(i=0;i<data.length;i++){
            var option = document.createElement("option");
            option.text = data[i].name +', '+data[i].city+', '+data[i].country;
            option.value = data[i].id;
            hospital_ele.add(option);
           }
         },
        error: function() {
          toastr.error('Something went wrong');;
            document.getElementById('load1').style.display='none';
        }
        });
    }

function getDoctorList(){
  var hos_id=document.getElementById('hospital-list').value;
  if (hos_id){
  document.getElementById('load1').style.display='flex';
    $.ajax({
        url: `/listDoctor/${hos_id}/?availability=true`,
        type:   'GET',
        success: function(data){
            document.getElementById('load1').style.display='none';
           var doctor_ele=document.getElementById('Doctor-list') ;
           var i;
           for(i=0;i<data.length;i++){
            var option = document.createElement("option");
            option.text = data[i].name +', '+data[i].qualification+', '+data[i].speciality;
            option.value = data[i].id;
            doctor_ele.add(option);
           }
         },
        error: function() {
          toastr.error('Something went wrong');;
            document.getElementById('load1').style.display='none';
        }
        });
      }
    }

    var $bookForm = $('#book_ap');

    $bookForm.on('submit', function(ev){
        ev.preventDefault();
        document.getElementById('load1').style.display='flex'
    $.ajax({
        url: "/addAppointment/",
        type:   'POST',
        data: $bookForm.serialize(),
        success: function(msg){
          if(msg == 'done'){
            toastr.success('Appointment Booked Successfully');
            document.getElementById('load1').style.display='none';
            // document.getElementById('book_ap').reset();
            document.getElementById('custom-tabs4-tab').click();
          }
          if(msg == 'full'){
            toastr.error('Appointment is full today, Try another date.');
            document.getElementById('load1').style.display='none';
        
          }
          if(msg == 'holiday'){
            toastr.error('Not available today, Try another date.');
            document.getElementById('load1').style.display='none';
    
          }
          if(msg == 'exists'){
            toastr.error('Appointment already booked for today');
            document.getElementById('load1').style.display='none';
    
          }
        },
        error: function() {
          toastr.error('Something went wrong');
            document.getElementById('load1').style.display='none'
        }
    });
});

function getappointments(type,pt_id){
  document.getElementById('load1').style.display='flex'
  get_list()
  $.ajax({
    url: `/getwatingappointments/${pt_id}/?type=${type}`,
    type:   'GET',
    success: function(data){
      if(type == 'waiting'){
        $("#results_waiting tr").remove();
          document.getElementById('load1').style.display='none';
          if(data.length != 0){
          feedData('#results_waiting',data);
          pager = new Pager('results_waiting', 10,'pg');
          pager.init();
          pager.showPageNav('pager', 'pageNavPosition_waiting');
          pager.showPage(1);}}
          if(type == 'upcoming'){
            $("#results_upcoming tr").remove();
              document.getElementById('load1').style.display='none';
              if(data.length != 0){
              feedData('#results_upcoming',data);
              pager = new Pager('results_upcoming',10 ,'pg1');
              pager.init();
              pager.showPageNav('pager', 'pageNavPosition_upcoming');
              pager.showPage(1);
            }}
            if(type == 'completed'){
              $("#results_completed tr").remove();
                document.getElementById('load1').style.display='none';
                if(data.length != 0){
                feedData('#results_completed',data);
                pager = new Pager('results_completed', 10,'pg2');
                pager.init();
                pager.showPageNav('pager', 'pageNavPosition_completed');
                pager.showPage(1);
              }}
              if(type == 'rejected'){
                $("#results_rejected tr").remove();
                  document.getElementById('load1').style.display='none';
                  if(data.length != 0){
                  feedData('#results_rejected',data);
                  pager = new Pager('results_rejected', 10,'pg3');
                  pager.init();
                  pager.showPageNav('pager', 'pageNavPosition_rejected');
                  pager.showPage(1);
                }}
        // pagination object codes.
function Pager(tableName, itemsPerPage,id) {
  this.tableName = tableName;
  this.itemsPerPage = itemsPerPage;
  this.currentPage = 1;
  this.pages = 0;
  this.inited = false;
  this.id=id;

  this.showRecords = function (from, to) {
    var rows = document.getElementById(tableName).rows;
    // i starts from 1 to skip table header row
    for (var i = 1; i < rows.length; i++) {
      if (i < from || i > to) rows[i].style.display = 'none';
      else rows[i].style.display = '';
    }
  }

  this.showPage = function (pageNumber) {
    if (!this.inited) {
      alert("not inited");
      return;
    }
    var oldPageAnchor = document.getElementById(this.id + this.currentPage);
    oldPageAnchor.className = 'pg-normal';

    this.currentPage = pageNumber;
    var newPageAnchor = document.getElementById(this.id + this.currentPage);
    newPageAnchor.className = 'pg-selected';

    var from = (pageNumber - 1) * itemsPerPage + 1;
    var to = from + itemsPerPage - 1;
    this.showRecords(from, to);
  }

  this.prev = function () {
    if (this.currentPage > 1) this.showPage(this.currentPage - 1);
  }

  this.next = function () {
    if (this.currentPage < this.pages) {
      this.showPage(this.currentPage + 1);
    }
  }

  this.init = function () {
    var rows = document.getElementById(tableName).rows;
    var records = (rows.length - 1);
    this.pages = Math.ceil(records / itemsPerPage);
    this.inited = true;
  }

  this.showPageNav = function (pagerName, positionId) {
    if (!this.inited) {
      alert("not inited");
      return;
    }
    var element = document.getElementById(positionId);
    var pagerHtml = '<span style="cursor:pointer;" onclick="' + pagerName + '.prev();" class="pg-normal"> &#171 Prev </span> | ';
    for (var page = 1; page <= this.pages; page++)
      pagerHtml += '<span style="cursor:pointer;" id="'+this.id + page + '" class="pg-normal" onclick="' + pagerName + '.showPage(' + page + ');">' + page + '</span> | ';
    pagerHtml += '<span style="cursor:pointer;" onclick="' + pagerName + '.next();" class="pg-normal"> Next &#187;</span>';
    element.innerHTML = pagerHtml;
  }
}
     },
    error: function() {
      toastr.error('Something went wrong');;
        document.getElementById('load1').style.display='none';
    }
    });
}

function feedData(id,tableData) {
  var tableContent = "";
  outerDiv = document.createElement('div')
  outerDiv.className = "row d-flex align-items-stretch"
  outerDiv.innerHTML = ''
  tableContent += `<thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Hospital</th>
        <th scope="col">Time Alloted</th>
        <th scope="col">Date</th>
      </tr>
    </thead>`;
    $.each(tableData, function () {
      tableContent += '<tr>';
      tableContent += `<td> Dr. &nbsp; ${this.doctor_name},&nbsp;${this.doctor_qualification},&nbsp;${this.doctor_speciality}</td>`;
      tableContent += `<td > ${this.hospital_name} </td>`;
      tableContent += `<td > ${this.time_alloted} </td>`;
      tableContent += `<td > ${this.date} </td>`;
      tableContent += '</tr>';
    });
    $(id).append(tableContent);
}