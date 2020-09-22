$(document).ready(view_appointments_now());

function view_appointments_now(){
    var id=document.getElementById('doc_id').value;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    document.getElementById('load1').style.display='flex';
    $.ajax({
        url: `/todayAppointments/${id}/?date=${today}`,
        type:   'GET',
        success: function(data){
            console.log(data);
            document.getElementById('app_view').innerHTML=data.length;
            $("#results_v tr").remove();
          document.getElementById('load1').style.display='none';
          feedData(data);
          pager = new Pager('results_v', 10,'pg_v');
          pager.init();
          pager.showPageNav('pager', 'pageNavPosition_v');
          pager.showPage(1);
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
            toastr.error('Something went wrong');
              document.getElementById('load1').style.display='none';
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
        <th scope="col">No.</th>
          <th scope="col">Patient Name</th>
          <th scope="col">Time</th>
          <th scope="col">Date</th>
        </tr>
      </thead>`;
      $.each(tableData, function () {
        tableContent += '<tr>';
        tableContent += '<td>' + this.number_alloted + '</td>';
        tableContent += '<td>' + this.pateint_name + '</td>';
        tableContent += '<td>' + this.time_alloted + '</td>';
        tableContent += '<td>' + this.date + '</td>';
        tableContent += '</tr>';
      });
      $('#results_v').append(tableContent);
  }

function click_view(){
    document.getElementById('custom-tabs1-tab').click();
}