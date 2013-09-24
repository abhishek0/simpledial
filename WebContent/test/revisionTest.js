RevisionTest = TestCase("RevisionTest");

RevisionTest.prototype.testDisplayRevision = function()
{
     /*
     * Test that a revision can be displayed inside of a made up DIV
     * node.
     */
     
    var element = document.createElement("div");
    displayRevision(element, "12345");
    
    /*
     * Validate that the a SPAN is added to the DIV.
     */
    
    var childElement = element.firstChild;
    
    assertNotNull(
           "Failed asserting that the DIV has any children.",
           childElement
    );
    
    var expected = "SPAN";
    var actual = childElement.nodeName;
    
    assertEquals(
           "Failed asserting that a SPAN was added to the DIV.",
           expected,
           actual
     );
     
     /*
     * Validate that the revision number is added to the SPAN.
     */
     
     var expected = "Revision: 12345";
     var actual = childElement.innerHTML;
     
     assertEquals(
           "Failed asserting that the SPAN contained the revision text.",
           expected,
           actual
     );
};
