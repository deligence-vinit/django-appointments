var days=2;  // max days ahead booking

$(document).ready(control_date('confirm'),control_date('view'),get_count(),get_holidays());

// update values in every 10 mins
setInterval(() =>{get_count()}, 600000);

var $contactForm = $('#doctor-form');
$contactForm.on('submit', function(ev){
    ev.preventDefault();
    document.getElementById('load1').style.display='flex'
    document.getElementById('link').value=window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    $.ajax({
        url: "/addDoctor/",
        type:   'POST',
        data: $contactForm.serialize(),
        success: function(msg){
          if (msg == 'exists'){
            toastr.error('Account already exists');
            document.getElementById('load1').style.display='none';
            // document.getElementById('doctor-form').reset();
          }
          else{
            toastr.success('Created Successfully, Login details are sent on mail');
            getDoctor('','view');
            document.getElementById('load1').style.display='none';
            document.getElementById('doctor-form').reset();
            document.getElementById('add_slot').textContent = '';
            document.getElementById('custom-tabs2-tab').click();
          }
        },
        error: function() {
          toastr.error('Something went wrong');
            document.getElementById('load1').style.display='none'
        }
    });
});
var $tab1=$('#custom-tabs1-tab');
$tab1.click(function(ev){
document.getElementById('load1').style.display='none';
});


$(document).ready(getDoctor('','view'));
  
function getDoctor(search,form){
  if(!search){
    search='';
  }
  var availability;
  if(form == 'view'){
    availability=''
  }
  if(form == 'book')
  {
    availability=true;
  }
  hos_id=document.getElementById('hos_id').value;
  // ev.preventDefault();
  document.getElementById('load1').style.display='flex'
  $.ajax({
      url: `/listDoctor/${hos_id}/?search=${search}&availability=${availability}`,
      type:   'GET',
      success: function(data){
        if(form == 'view'){
          $("#results tr").remove();
          document.getElementById('load1').style.display='none';
          feedData(data);
          pager = new Pager('results', 10,'pg');
          pager.init();
          pager.showPageNav('pager', 'pageNavPosition');
          pager.showPage(1);
          document.getElementById('search').value=search;
        }
       if(form == 'book'){
        $("#results_book tr").remove();
        document.getElementById('load1').style.display='none';
        feedData_book(data);
        pager_book = new Pager('results_book', 10,'pg_book');
        pager_book.init();
        pager_book.showPageNav('pager_book', 'pageNavPosition_book');
        pager_book.showPage(1);
        document.getElementById('search_book').value=search;

       }

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

        }
      });
  }
  function feedData(tableData) {
    var tableContent = "";
    outerDiv = document.createElement('div')
    outerDiv.className = "row d-flex align-items-stretch"
    outerDiv.innerHTML = ''
    tableContent += `<thead>
        <tr>
          <th scope="col">Name</th>
          <td scope="col"></td>
          <td class="p-0 d-flex justify-content-end"><div class="form-inline ml-3">
          <div class="input-group input-group-sm">
            <input class="form-control form-control-navbar" type="search" id="search" placeholder="Search" aria-label="Search">
            <div class="input-group-append">
              <button class="btn btn-navbar" onclick="search_doc('view'); return false;" type="button">
                <i class="fas fa-search"></i>
              </button>
            </div>
            <div class="input-group-append pl-2">
    <button class="btn btn-navbar" style="background-color:darkgray;border-radius: 30px;" type="button" onclick="clearsearch('view'); return false;">
      Clear Search
    </button>
   </div>
          </div>
        </div></td>
        </tr>
      </thead>`;
      $.each(tableData, function () {
        tableContent += '<tr>';
        tableContent += `<td> Dr. &nbsp; ${this.name}, ${this.qualification}, ${this.speciality}</td>`;
        if(this.is_available == true){
          tableContent += `<td style="padding-left:22px;"><a href="#" title="Set Unavailable" onclick="changestate('available','${this.id}'); return false;" class="available">available</a></td>`;
        }
        if(this.is_available == false){
          tableContent += `<td><a href="#" title="Set Available" onclick="changestate('unavailable','${this.id}'); return false;" class="unavailable">unavailable</a></td>`;
        }
        tableContent += `<td class="d-flex justify-content-end mr-5"><a onclick="edit_doctor('${this.id}'); return false;" title="Edit" href="#"><i class="fas fa-edit fa-lg text-black" ></i></a>`;
        tableContent += `&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="confirm('Are you sure you want to delete ?'); delete_doctor('${this.id}'); return false;" title="Delete" href="#"><i class="fas fa-trash-alt fa-lg text-black" ></i></a></td>`;
        tableContent += '</tr>';
      });
      $('#results').append(tableContent);
  }
// end get doctor

function feedData_book(tableData) {
  var tableContent = "";
  outerDiv = document.createElement('div')
  outerDiv.className = "row d-flex align-items-stretch"
  outerDiv.innerHTML = ''
  tableContent += `<thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Qualification</th>
        <th scope="col">Speciality</th>
        <td class="p-0 d-flex justify-content-end"><div class="form-inline ml-3">
        <div class="input-group input-group-sm">
          <input class="form-control form-control-navbar" type="search" id="search_book" placeholder="Search" aria-label="Search">
          <div class="input-group-append">
            <button class="btn btn-navbar" onclick="search_doc('book'); return false;" type="button">
              <i class="fas fa-search"></i>
            </button>
          </div>
          <div class="input-group-append pl-2">
  <button class="btn btn-navbar" style="background-color:darkgray;border-radius: 30px;" type="button" onclick="clearsearch('book'); return false;">
    Clear Search
  </button>
 </div>
        </div>
      </div></td>
      </tr>
    </thead>`;
    $.each(tableData, function () {
      tableContent += '<tr>';
      tableContent += '<td> Dr. &nbsp;' + this.name + '</td>';
      tableContent += '<td>' + this.qualification + '</td>';
      tableContent += '<td>' + this.speciality + '</td>';
      tableContent += `<td class="d-flex justify-content-end mr-5"><a onclick="add_appointments('${this.id}','${this.name}','${this.qualification}','${this.speciality}'); return false;" data-keyboard="false" data-backdrop="static" data-toggle="modal" data-target="#myModal_add"  title="Book Appointment" href="#"><i class="fa fa-plus fa-lg text-black" aria-hidden="true"></i></a>`;
      tableContent += `&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="view_appointments('${this.id}'); return false;" title="View Appointments" href="#"><i class="fa fa-eye fa-lg text-black" ></i></a></td>`;
      tableContent += '</tr>';
    });
    $('#results_book').append(tableContent);
}



var counter =0;
var cmp_counter=0
function add_slots(id){
if (counter < 3){
var newdiv = document.createElement('div');
newdiv.setAttribute("id", "time" + cmp_counter);
newdiv.innerHTML=`<div class="input-group pt-2">
<input type="time" class="form-control" id="from_time" name="from_time[]">_
<input type="time" class="form-control" id="to_time" name="to_time[]">
<div class="input-group-append">
  <span class="input-group-text"><a href="#" onclick="remove_slots(time${cmp_counter}); return false;"><i class="fa fa-minus fa-sm" aria-hidden="true"></i></a></span>
</div>
</div>`
document.getElementById(id).appendChild(newdiv);
counter++;
cmp_counter++;
}}

function remove_slots(divName) {
    var element = document.getElementById(divName.id);
    element.parentNode.removeChild(element);
    counter--;
}


function edit_doctor(id){
  document.getElementById('doctor-form-edit').reset();
  var tab3=document.getElementById('custom-tabs3-tab');
  tab3.style.display="flex";
  tab3.click();
  document.getElementById('load1').style.display='flex'
  $.ajax({
      url: `/editDoctor/${id}/`,
      type:   'GET',
      success: function(data){
          document.getElementById('load1').style.display='none';
          document.getElementById('name-edit').value=data[0].name;
          document.getElementById('email-edit').value=data[0].email;
          document.getElementById('phone-edit').value=data[0].phone;
          document.getElementById('qualification-edit').value=data[0].qualification;
          document.getElementById('speciality-edit').value=data[0].speciality;
          document.getElementById('doc_id').value=data[0].id;
    
          var i;  
          for(i=1;i<data.length;i++){
            if(i == 1){
              document.getElementById('from_time-edit').value=data[1].from_time;
              document.getElementById('to_time-edit').value=data[1].to_time;
            }
            if(i > 1){
              var newdiv = document.createElement('div');
              newdiv.setAttribute("id", "time_edit"+i);
              newdiv.innerHTML=`<div class="input-group pt-2">
              <input type="time" class="form-control " value="${data[i].from_time}" id="from_time-edit${i}" name="from_time[]">_
              <input type="time" class="form-control " value="${data[i].to_time}" id="to_time-edit${i}" name="to_time[]">
              <div class="input-group-append">
                <span class="input-group-text"><a href="#" onclick="remove_slots(time_edit${i}); return false;"><i class="fa fa-minus fa-sm" aria-hidden="true"></i></a></span>
              </div>
              </div>`
              document.getElementById('add_slot-edit').appendChild(newdiv);

            }
          }
}
  });
}


var $contactForm_edit = $('#doctor-form-edit');

$contactForm_edit.on('submit', function(ev){
    ev.preventDefault();
    document.getElementById('load1').style.display='flex'
    var doc_id=document.getElementById('doc_id').value;
    $.ajax({
        url: `/editDoctor/${doc_id}/`,
        type:   'POST',
        data: $contactForm_edit.serialize(),
        success: function(msg){
            toastr.success('Submitted Sucessfully');
            document.getElementById('load1').style.display='none';
            document.getElementById('doctor-form-edit').reset();
            document.getElementById('custom-tabs2-tab').click();
            document.getElementById('custom-tabs3-tab').style.display='none';
            getDoctor('','view');
            document.getElementById('add_slot-edit').textContent = '';
            
        },
        error: function() {
          toastr.error('Something went wrong');
            document.getElementById('load1').style.display='none'
        }
    });
});

function delete_doctor(id){
  document.getElementById('load1').style.display='flex'
  $.ajax({
      url: `/deleteDoctor/${id}/`,
      type:   'GET',
      success: function(data){
          toastr.success('Deleted Successfully')
          document.getElementById('load1').style.display='none';
          getDoctor('','view');
        },
        error: function() {
          toastr.error('Something went wrong');
            document.getElementById('load1').style.display='none'
        }
    });
}

function search_doc(type){
  if(type == 'view'){
 var search=document.getElementById("search").value;
  }
  if(type == 'book'){
    var search=document.getElementById("search_book").value;
     }
 getDoctor(search,type);
}


function clearsearch(type){
  getDoctor('',type);
}

function book_appointment(){
  var custom_tab4=document.getElementById('custom-tabs4-tab');
  custom_tab4.style.display="flex";
  custom_tab4.click();
}

function confirm_appointments(){
  var custom_tab5=document.getElementById('custom-tabs5-tab');
  custom_tab5.style.display="flex";
  custom_tab5.click();
}

function view_appointments(id){
  if(id){
    document.getElementById('doc_id_appointment').value=id;
  }
  var custom_tab6=document.getElementById('custom-tabs6-tab');
  custom_tab6.style.display="flex";
  custom_tab6.click();
}

function add_holidays(){
  var custom_tab8=document.getElementById('custom-tabs7-tab');
  custom_tab8.style.display="flex";
  custom_tab8.click();
}

function add_appointments(id,doc_name,doc_qualification,doc_speciality){
  document.getElementById('doc_id_book').value=id;
  document.getElementById('doc_name').innerHTML='Dr. '+doc_name;
  document.getElementById('doc_qualification').innerHTML=doc_qualification;
  document.getElementById('doc_speciality').innerHTML=doc_speciality;
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
var $appointment_book = $('#appointment_book');
function submit_book_appointment(){
  document.getElementById('fade_add').style.display='flex';
  $.ajax({
      url: "/addAppointment/",
      type:   'POST',
      data: $appointment_book.serialize(),
      success: function(msg){
        toastr.success('Booked Successfully');
        document.getElementById('fade_add').style.display='none';
      },
      error: function() {
        toastr.error('Something went wrong');
          document.getElementById('fade_add').style.display='none';
      }
  });
}

function get_appointments(type){
  var date
  var add_doc=''
  document.getElementById('load1').style.display='flex'
  var doc_id_app=document.getElementById('doc_id_appointment')
  hos_id=document.getElementById('hos_id').value;
  if (type == 'confirm')
  {
    date=document.getElementById('cstm_date1').value;
  }
  if (type == 'view')
  { if(doc_id_app.value){
    add_doc=`&doc=${doc_id_app.value}`;
    doc_id_app.value=null;
  }
    date=document.getElementById('cstm_date').value;
  }
  $.ajax({
    url: `/waitingApp/${hos_id}/?type=${type}&date=${date}${add_doc}`,
    type:   'GET',
    success: function(data){
      if (type == 'confirm'){
          get_count();
        $("#results_confirm tr").remove();
          document.getElementById('load1').style.display='none';
          if(data.length != 0){
          feedData_data('confirm','#results_confirm',data);
          pager1 = new Pager1('results_confirm', 10,'pg');
          pager1.init();
          pager1.showPageNav('pager1', 'pageNavPosition_confirm');
          pager1.showPage(1);}
      }
      if (type == 'view'){
        $("#results_view tr").remove();
          document.getElementById('load1').style.display='none';
          if(data.length != 0){
          feedData_data('view','#results_view',data);
          pager1 = new Pager1('results_view',10,'pg');
          pager1.init();
          pager1.showPageNav('pager1', 'pageNavPosition_view');
          pager1.showPage(1);}
      }
        // pagination object codes.
  function Pager1(tableName, itemsPerPage,id) {
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

function feedData_data(type,id,tableData) {
  var tableContent = "";
  outerDiv = document.createElement('div')
  outerDiv.className = "row d-flex align-items-stretch"
  outerDiv.innerHTML = ''
  tableContent += `<thead>
      <tr>
        <th scope="col">Doctor's Name</th>
        <th scope="col">Patient's Name</th>
        
        <th scope="col" class="text-center">Time Alloted</th>
        <th scope="col" class="text-center">Date</th>
      </tr>
    </thead>`;
    $.each(tableData, function () {
      tableContent += '<tr>';
      tableContent += `<td> Dr.&nbsp; ${this.doctor_name},&nbsp;${this.doctor_speciality}</td>`;
      tableContent += `<td > ${this.pateint_name} </td>`;
      // tableContent += `<td class="text-center"> ${this.number_alloted} </td>`;
      tableContent += `<td class="text-center"> ${this.time_alloted} </td>`;
      tableContent += `<td class="text-center"> ${this.date} </td>`;
      if(type == 'confirm'){
      tableContent += `<td style="display:inline-flex;"><a href="#" title="Confirm" onclick="confirm_appointments_now('${this.appointment_id}'); return false;"><i class="fa fa-check-circle fa-lg text-black"> </i></a>`;
      tableContent += `&nbsp;&nbsp;<a href="#" title="Reject" onclick="confirm('Are you sure you want to reject this appointment ?'); reject_appointments_now('${this.appointment_id}'); return false;"><i class="fa fa-times-circle fa-lg text-black"> </i></a></td>`;
    }
    if(type == 'view' && (this.is_completed != true && this.is_rejected !=true) )
    {
      tableContent += `<td style="display:inline-flex;"><a href="#" title="Mark as completed" onclick="complete_appointments_now('${this.appointment_id}'); return false;"><i class="fa fa-check-circle fa-lg text-black"> </i></a>`;
      tableContent += `&nbsp;&nbsp;<a href="#" title="Mark not arrived" onclick="confirm('Are you sure you want to mark as patient not arrived ?'); reject_appointments_now('${this.appointment_id}'); return false;"><i class="fa fa-times-circle fa-lg text-black"> </i></a></td>`;      
    }
    if (this.is_completed == true && this.is_confirmed == true ){
      tableContent += `<td><a href="#" title="Completed" onclick="return false;"><i class="fa fa-check-circle fa-lg" style="color:green;"> </i></a></td>`
    }
    if (this.is_rejected == true && this.is_completed == false){
      tableContent += `<td><a href="#" title="Rejected, Click to delete" onclick="confirm('Are you sure you want delete ?'); delete_appointment('${this.appointment_id}'); return false;"><i class="fa fa-times-circle fa-lg" style="color:red;"> </i></a></td>`
    }
      tableContent += '</tr>';
    });
    $(id).append(tableContent);
}

function confirm_appointments_now(appointment_id){

  document.getElementById('load1').style.display='flex';
  $.ajax({
      url: `/confirm_appointments_now/${appointment_id}/`,
      type:   'GET',
      success: function(data){
        get_appointments('confirm');
          toastr.success('Confirmed Successfully');
          document.getElementById('load1').style.display='none';
        },
        error: function() {
          toastr.error('Something went wrong');
            document.getElementById('load1').style.display='none';
        }
    });

}
function reject_appointments_now(appointment_id){
  document.getElementById('load1').style.display='flex';
  $.ajax({
      url: `/reject_appointments_now/${appointment_id}/`,
      type:   'GET',
      success: function(data){
        get_appointments('confirm')
          toastr.error('Rejected');
          get_appointments('view')
          document.getElementById('load1').style.display='none';
        },
        error: function() {
          toastr.error('Something went wrong');
            document.getElementById('load1').style.display='none';
        }
    });
  
}

function control_date(type){
  if (type == 'confirm'){
  var element_id=document.getElementById('cstm_date1');
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        element_id.min = element_id.value = yyyy + '-' + mm + '-' + dd;
        
        today.setDate(today.getDate() + days); 
        dd = String(today.getDate()).padStart(2, '0');
        mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        yyyy = today.getFullYear();
        element_id.max=yyyy + '-' + mm + '-' + dd;
  }
  if (type == 'view'){
    var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        document.getElementById('cstm_date').value = yyyy + '-' + mm + '-' + dd;
  }
}

function complete_appointments_now(appointment_id){
  document.getElementById('load1').style.display='flex';
  $.ajax({
      url: `/complete_appointments_now/${appointment_id}/`,
      type:   'GET',
      success: function(data){
        get_appointments('confirm')
          toastr.success('Done');
          get_appointments('view')
          document.getElementById('load1').style.display='none';
        },
        error: function() {
          toastr.error('Something went wrong');
            document.getElementById('load1').style.display='none';
        }
    });
  }

function get_count(){
  hos_id=document.getElementById('hos_id').value;
  $.ajax({
    url: `/count/${hos_id}/`,
    type:   'GET',
    success: function(data){
    document.getElementById('pending_ring_count').innerHTML=data[0].pending_count;
    document.getElementById('pending_count').innerHTML=data[0].pending_count;
    document.getElementById('pending_count_side').innerHTML=data[0].pending_count;
    document.getElementById('view_count').innerHTML=data[1].view_count;
    // document.getElementById('book_count').innerHTML=data[2].available_doctor_count;
    
      }
  });
 }

 function changestate(state,id)
{
    document.getElementById('load1').style.display='flex';
  $.ajax({
      url: `/changestate/${id}/${state}/`,
      type:   'GET',
      success: function(data){
        getDoctor('','view')
        document.getElementById('load1').style.display='none';
        },
        error: function() {
          toastr.error('Something went wrong');
            document.getElementById('load1').style.display='none';
        }
    });
}

function add_date(id){
var counter1=0;
var newdiv = document.createElement('div');
newdiv.setAttribute("id", "date" + counter1);
newdiv.innerHTML=`<div class="input-group pt-2">
<input type="date" class="form-control" name="date[]" required>
<div class="input-group-append">
  <span class="input-group-text"><a href="#" onclick="remove_date('date${counter1}'); return false;"><i class="fa fa-minus fa-sm" aria-hidden="true"></i></a></span>
</div>
</div>`
document.getElementById(id).appendChild(newdiv);
counter1++;
}

function remove_date(id) {
  var divName=document.getElementById(id);
  var element = document.getElementById(divName.id);
  element.parentNode.removeChild(element);
}

var $holidayForm = $('#holidays_add');
$holidayForm.on('submit', function(ev){
var id=document.getElementById('hospital_id').value;
    ev.preventDefault();
    document.getElementById('load1').style.display='flex';
    $.ajax({
        url: `/addHoliday/${id}/`,
        type:   'POST',
        data: $holidayForm.serialize(),
        success: function(msg){
          get_holidays()
          toastr.success('Added Successfully');
            document.getElementById('load1').style.display='none';
          
        },
        error: function() {
          toastr.error('Something went wrong');
            document.getElementById('load1').style.display='none'
        }
    });
});


function get_holidays(){
  hos_id=document.getElementById('hos_id').value;
  var i,j,k;
  $.ajax({
    url: `/addHoliday/${hos_id}/`,
    type:   'GET',
    success: function(data){
    
    document.getElementById('add_date').textContent="";
    document.getElementById('holidays_count').innerHTML=data[1].length;
    for(i=0;i<data[0].length;i++)
      {
        document.getElementById(data[0][i].weekday).checked=true;
        
      }
      for(j=0;j<data[1].length;j++){
      var newdiv = document.createElement('div');
        newdiv.setAttribute("id", "add_date" + j);
        newdiv.innerHTML=`<div class="input-group pt-2">
        <input type="date" class="form-control" name="date[]" value=${data[1][j].date} required>
        <div class="input-group-append">
          <span class="input-group-text"><a href="#" onclick="remove_date('add_date${j}'); return false;"><i class="fa fa-minus fa-sm" aria-hidden="true"></i></a></span>
        </div>
        </div>`
        document.getElementById('add_date').appendChild(newdiv);

      }
      }
  });
 }

function delete_appointment(id){
  document.getElementById('load1').style.display='flex';
$.ajax({

  url: `/deleteAppointment/${id}/`,
  type:   'GET',
  success: function(msg){
    get_count()
    get_appointments('view')
    toastr.success('Deleted Successfully');
      document.getElementById('load1').style.display='none';
    
  },
  error: function() {
    toastr.error('Something went wrong');
      document.getElementById('load1').style.display='none'
  }

});
 }